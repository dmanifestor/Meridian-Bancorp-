# Security Specification: Strict User Data Isolation

## 1. Data Invariants

1. **Strict Ownership Invariant**: Every user document, subcollection, or user-scoped record (`wallets`, `orders`, `positions`, `investments`) can only be read or written by the authenticated user whose `request.auth.uid` matches the document's `userId` (or path `{userId}`).
2. **Zero Cross-User Access**: An authenticated User A cannot read, query, list, modify, or delete any record belonging to User B under any circumstances.
3. **No Unauthenticated Access**: Unauthenticated requests (`request.auth == null`) are unconditionally denied for all collections and paths.
4. **Identity Immutability**: The `userId` property is immutable upon document creation and cannot be reassigned or spoofed during updates.
5. **Temporal Integrity**: Creation timestamps (`createdAt`) must match server `request.time` on create and remain immutable on update. Modification timestamps (`updatedAt`) must match server `request.time`.
6. **Path ID & Field Validation**: Document IDs and path parameters must satisfy `isValidId()` (`<= 128` characters, alphanumeric, dashes, and underscores only).
7. **Query Enforcement (Anti-Scraping)**: Collection queries (`allow list`) must strictly enforce `resource.data.userId == request.auth.uid` so that clients cannot query or scrape records across users.

---

## 2. The "Dirty Dozen" Payloads (Hostile Vectors)

1. **Payload 1: Unauthenticated Read Attempt**
   - Operation: `get /users/user_alice`
   - Auth: `null`
   - Expected: `PERMISSION_DENIED`
2. **Payload 2: Cross-User Profile Read (User B reading User A)**
   - Operation: `get /users/user_alice`
   - Auth: `{ uid: "user_bob" }`
   - Expected: `PERMISSION_DENIED`
3. **Payload 3: Cross-User Profile Write/Overwrite**
   - Operation: `update /users/user_alice`
   - Auth: `{ uid: "user_bob" }`
   - Data: `{ "name": "Hacked", "userId": "user_alice" }`
   - Expected: `PERMISSION_DENIED`
4. **Payload 4: Identity Spoofing on Profile Create**
   - Operation: `create /users/user_alice`
   - Auth: `{ uid: "user_alice" }`
   - Data: `{ "userId": "user_charlie", "username": "alice", "name": "Alice" }`
   - Expected: `PERMISSION_DENIED` (Incoming `userId` does not match `request.auth.uid`)
5. **Payload 5: Path Variable ID Poisoning**
   - Operation: `create /users/user_alice<script>alert(1)</script>`
   - Auth: `{ uid: "user_alice<script>alert(1)</script>" }`
   - Expected: `PERMISSION_DENIED` (Fails `isValidId`)
6. **Payload 6: Cross-User Subcollection Read**
   - Operation: `get /users/user_alice/wallets/main`
   - Auth: `{ uid: "user_bob" }`
   - Expected: `PERMISSION_DENIED`
7. **Payload 7: Cross-User Subcollection Write**
   - Operation: `create /users/user_alice/orders/order_99`
   - Auth: `{ uid: "user_bob" }`
   - Data: `{ "userId": "user_bob", "pair": "BTC/USDT", "side": "buy", "amount": 10 }`
   - Expected: `PERMISSION_DENIED`
8. **Payload 8: Blanket Collection Query / List Scraping**
   - Operation: `list /users`
   - Auth: `{ uid: "user_bob" }`
   - Query: `db.collection("users")` (No filter for `userId == bob`)
   - Expected: `PERMISSION_DENIED`
9. **Payload 9: Cross-User Top-Level Order Read**
   - Operation: `get /orders/order_123`
   - Resource Data: `{ "userId": "user_alice", "pair": "ETH/USDT" }`
   - Auth: `{ uid: "user_bob" }`
   - Expected: `PERMISSION_DENIED`
10. **Payload 10: Cross-User Top-Level Order Tampering**
    - Operation: `update /orders/order_123`
    - Resource Data: `{ "userId": "user_alice", "status": "open" }`
    - Auth: `{ uid: "user_bob" }`
    - Incoming Data: `{ "userId": "user_alice", "status": "cancelled" }`
    - Expected: `PERMISSION_DENIED`
11. **Payload 11: Ownership Stealing / Transfer on Update**
    - Operation: `update /orders/order_123`
    - Resource Data: `{ "userId": "user_alice", "status": "open" }`
    - Auth: `{ uid: "user_alice" }`
    - Incoming Data: `{ "userId": "user_bob", "status": "open" }`
    - Expected: `PERMISSION_DENIED` (Owner field is immutable)
12. **Payload 12: Client Timestamp Manipulation on Create**
    - Operation: `create /users/user_alice`
    - Auth: `{ uid: "user_alice" }`
    - Incoming Data: `{ "userId": "user_alice", "username": "alice", "name": "Alice", "createdAt": "1999-01-01T00:00:00Z" }`
    - Expected: `PERMISSION_DENIED` (`createdAt` must match `request.time`)

---

## 3. The Test Runner: firestore.rules.test.ts

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import * as fs from 'fs';

let testEnv: RulesTestEnvironment;

beforeEach(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'xenodochial-meridian-llxdt',
    firestore: {
      rules: fs.readFileSync('firestore.rules', 'utf8'),
    },
  });
});

afterEach(async () => {
  await testEnv.cleanup();
});

describe('Zero-Trust Per-User Data Isolation', () => {
  it('Payload 1: Rejects unauthenticated read to user profile', async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(unauthedDb.doc('users/alice').get());
  });

  it('Payload 2: Rejects User Bob attempting to read User Alice profile', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().doc('users/alice').set({
        userId: 'alice',
        username: 'alice_trader',
        name: 'Alice Smith',
      });
    });

    const bobDb = testEnv.authenticatedContext('bob').firestore();
    await assertFails(bobDb.doc('users/alice').get());
  });

  it('Payload 3: Rejects User Bob updating Alice profile', async () => {
    const bobDb = testEnv.authenticatedContext('bob').firestore();
    await assertFails(bobDb.doc('users/alice').update({ name: 'Hacked' }));
  });

  it('Payload 4: Rejects identity spoofing on user creation', async () => {
    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    await assertFails(
      aliceDb.doc('users/alice').set({
        userId: 'charlie',
        username: 'alice_user',
        name: 'Alice',
      })
    );
  });

  it('Payload 5: Rejects invalid ID characters', async () => {
    const db = testEnv.authenticatedContext('attacker<script>').firestore();
    await assertFails(
      db.doc('users/attacker<script>').set({
        userId: 'attacker<script>',
        username: 'bad',
        name: 'Bad',
      })
    );
  });

  it('Payload 6: Rejects User Bob reading Alice subcollection wallet', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().doc('users/alice/wallets/main').set({
        userId: 'alice',
        totalUsd: 50000,
        availableUsd: 25000,
      });
    });

    const bobDb = testEnv.authenticatedContext('bob').firestore();
    await assertFails(bobDb.doc('users/alice/wallets/main').get());
  });

  it('Payload 7: Rejects User Bob writing into Alice orders subcollection', async () => {
    const bobDb = testEnv.authenticatedContext('bob').firestore();
    await assertFails(
      bobDb.doc('users/alice/orders/ord_1').set({
        userId: 'bob',
        pair: 'BTC/USDT',
        side: 'buy',
        amount: 1,
      })
    );
  });

  it('Payload 8: Rejects unconstrained cross-user queries', async () => {
    const bobDb = testEnv.authenticatedContext('bob').firestore();
    await assertFails(bobDb.collection('users').get());
  });

  it('Payload 9: Rejects Bob reading Alice top-level order', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().doc('orders/ord_alice').set({
        userId: 'alice',
        pair: 'BTC/USDT',
        price: 90000,
      });
    });

    const bobDb = testEnv.authenticatedContext('bob').firestore();
    await assertFails(bobDb.doc('orders/ord_alice').get());
  });

  it('Payload 10: Rejects Bob updating Alice top-level order', async () => {
    const bobDb = testEnv.authenticatedContext('bob').firestore();
    await assertFails(
      bobDb.doc('orders/ord_alice').update({ status: 'cancelled' })
    );
  });

  it('Payload 11: Rejects altering owner userId on update', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().doc('orders/ord_alice').set({
        userId: 'alice',
        pair: 'BTC/USDT',
        status: 'open',
      });
    });

    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    await assertFails(
      aliceDb.doc('orders/ord_alice').update({ userId: 'bob' })
    );
  });

  it('Payload 12: Permits Alice to access exclusively her own profile and data', async () => {
    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    // Valid write by Alice for Alice
    await assertSucceeds(
      aliceDb.doc('users/alice').set({
        userId: 'alice',
        username: 'alice_trader',
        name: 'Alice S',
      })
    );

    // Valid read by Alice of her own profile
    await assertSucceeds(aliceDb.doc('users/alice').get());
  });
});
```
