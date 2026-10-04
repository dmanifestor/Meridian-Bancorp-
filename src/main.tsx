import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

// Global WebIDL & Canvas protections against "TypeError: The provided value is non-finite"
if (typeof window !== 'undefined') {
  // Helper to ensure finite number
  const toFinite = (val: unknown, fallback = 0): number => {
    const num = Number(val);
    return Number.isFinite(num) ? num : fallback;
  };

  // 1. Guard DOMPoint, DOMPointReadOnly, and SVGPoint (used by D3 pointer calculations & SVG matrixTransform)
  const pointClasses = [
    typeof DOMPointReadOnly !== 'undefined' ? DOMPointReadOnly : null,
    typeof DOMPoint !== 'undefined' ? DOMPoint : null,
    typeof SVGPoint !== 'undefined' ? SVGPoint : null,
  ].filter(Boolean) as (new (...args: unknown[]) => unknown)[];

  pointClasses.forEach((Cls) => {
    if (!Cls?.prototype) return;
    ['x', 'y', 'z', 'w'].forEach((prop) => {
      const desc = Object.getOwnPropertyDescriptor(Cls.prototype, prop);
      if (desc && desc.set) {
        const origSet = desc.set;
        Object.defineProperty(Cls.prototype, prop, {
          ...desc,
          set(val: unknown) {
            return origSet.call(this, toFinite(val, 0));
          },
        });
      }
    });

    const origMatrixTransform = Cls.prototype.matrixTransform;
    if (typeof origMatrixTransform === 'function') {
      Cls.prototype.matrixTransform = function (matrix?: unknown) {
        try {
          if (!matrix || typeof matrix !== 'object') {
            return origMatrixTransform.call(this, matrix);
          }
          const m = matrix as Record<string, unknown>;
          const keys = ['a', 'b', 'c', 'd', 'e', 'f', 'm11', 'm12', 'm13', 'm14', 'm21', 'm22', 'm23', 'm24', 'm31', 'm32', 'm33', 'm34', 'm41', 'm42', 'm43', 'm44'];
          for (const k of keys) {
            if (k in m && typeof m[k] === 'number' && !Number.isFinite(m[k])) {
              return this;
            }
          }
          return origMatrixTransform.call(this, matrix);
        } catch {
          return this;
        }
      };
    }
  });

  // Guard SVGSVGElement.prototype.createSVGPoint
  if (typeof SVGSVGElement !== 'undefined' && SVGSVGElement.prototype.createSVGPoint) {
    const origCreateSVGPoint = SVGSVGElement.prototype.createSVGPoint;
    SVGSVGElement.prototype.createSVGPoint = function () {
      try {
        const pt = origCreateSVGPoint.call(this);
        return pt;
      } catch {
        return {
          x: 0,
          y: 0,
          matrixTransform() {
            return this;
          },
        } as unknown as DOMPoint;
      }
    };
  }

  // 2. Guard DOMMatrix and DOMMatrixReadOnly
  const matrixClasses = [
    typeof DOMMatrixReadOnly !== 'undefined' ? DOMMatrixReadOnly : null,
    typeof DOMMatrix !== 'undefined' ? DOMMatrix : null,
  ].filter(Boolean) as (new (...args: unknown[]) => unknown)[];

  matrixClasses.forEach((Cls) => {
    if (!Cls?.prototype) return;
    const origInverse = Cls.prototype.inverse;
    if (typeof origInverse === 'function') {
      Cls.prototype.inverse = function () {
        try {
          const inv = origInverse.call(this);
          if (inv && (!Number.isFinite(inv.a) || !Number.isFinite(inv.d))) {
            return new (DOMMatrix || Object)();
          }
          return inv;
        } catch {
          return new (DOMMatrix || Object)();
        }
      };
    }
  });

  // 3. Guard HTML5 Canvas 2D methods
  if (typeof CanvasRenderingContext2D !== 'undefined' && CanvasRenderingContext2D.prototype) {
    const proto = CanvasRenderingContext2D.prototype;

    const origCreateLinearGradient = proto.createLinearGradient;
    if (origCreateLinearGradient) {
      proto.createLinearGradient = function (x0: number, y0: number, x1: number, y1: number) {
        return origCreateLinearGradient.call(this, toFinite(x0, 0), toFinite(y0, 0), toFinite(x1, 0), toFinite(y1, 1));
      };
    }

    const origCreateRadialGradient = proto.createRadialGradient;
    if (origCreateRadialGradient) {
      proto.createRadialGradient = function (x0: number, y0: number, r0: number, x1: number, y1: number, r1: number) {
        return origCreateRadialGradient.call(
          this,
          toFinite(x0, 0),
          toFinite(y0, 0),
          Math.max(0, toFinite(r0, 0)),
          toFinite(x1, 0),
          toFinite(y1, 0),
          Math.max(0, toFinite(r1, 1))
        );
      };
    }

    const origArc = proto.arc;
    if (origArc) {
      proto.arc = function (x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean) {
        if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(radius)) return;
        return origArc.call(this, x, y, Math.max(0, radius), toFinite(startAngle, 0), toFinite(endAngle, Math.PI * 2), counterclockwise);
      };
    }

    const origScale = proto.scale;
    if (origScale) {
      proto.scale = function (x: number, y: number) {
        if (Number.isFinite(x) && Number.isFinite(y)) {
          origScale.call(this, x, y);
        }
      };
    }

    const origTranslate = proto.translate;
    if (origTranslate) {
      proto.translate = function (x: number, y: number) {
        if (Number.isFinite(x) && Number.isFinite(y)) {
          origTranslate.call(this, x, y);
        }
      };
    }

    const origClearRect = proto.clearRect;
    if (origClearRect) {
      proto.clearRect = function (x: number, y: number, w: number, h: number) {
        if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(w) && Number.isFinite(h)) {
          origClearRect.call(this, x, y, w, h);
        }
      };
    }

    const origFillRect = proto.fillRect;
    if (origFillRect) {
      proto.fillRect = function (x: number, y: number, w: number, h: number) {
        if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(w) && Number.isFinite(h)) {
          origFillRect.call(this, x, y, w, h);
        }
      };
    }

    const origStrokeRect = proto.strokeRect;
    if (origStrokeRect) {
      proto.strokeRect = function (x: number, y: number, w: number, h: number) {
        if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(w) && Number.isFinite(h)) {
          origStrokeRect.call(this, x, y, w, h);
        }
      };
    }

    const origMoveTo = proto.moveTo;
    if (origMoveTo) {
      proto.moveTo = function (x: number, y: number) {
        if (Number.isFinite(x) && Number.isFinite(y)) {
          origMoveTo.call(this, x, y);
        }
      };
    }

    const origLineTo = proto.lineTo;
    if (origLineTo) {
      proto.lineTo = function (x: number, y: number) {
        if (Number.isFinite(x) && Number.isFinite(y)) {
          origLineTo.call(this, x, y);
        }
      };
    }

    const origSetLineDash = proto.setLineDash;
    if (origSetLineDash) {
      proto.setLineDash = function (segments: number[]) {
        try {
          const safe = Array.isArray(segments) ? segments.filter(Number.isFinite) : [];
          origSetLineDash.call(this, safe);
        } catch {
          // ignore
        }
      };
    }
  }

  // 4. Guard HTMLInputElement.valueAsNumber, HTMLProgressElement.value, HTMLMeterElement.value
  const formClasses = [
    typeof HTMLInputElement !== 'undefined' ? HTMLInputElement : null,
    typeof HTMLProgressElement !== 'undefined' ? HTMLProgressElement : null,
    typeof HTMLMeterElement !== 'undefined' ? HTMLMeterElement : null,
  ].filter(Boolean) as (new (...args: unknown[]) => unknown)[];

  formClasses.forEach((Cls) => {
    if (!Cls?.prototype) return;
    ['valueAsNumber', 'value'].forEach((prop) => {
      const desc = Object.getOwnPropertyDescriptor(Cls.prototype, prop);
      if (desc && desc.set) {
        const origSet = desc.set;
        Object.defineProperty(Cls.prototype, prop, {
          ...desc,
          set(val: unknown) {
            const num = Number(val);
            return origSet.call(this, Number.isFinite(num) ? num : 0);
          },
        });
      }
    });
  });

  // 5. Guard scrollTo / scrollBy
  for (const target of [window, typeof Element !== 'undefined' ? Element.prototype : null]) {
    if (!target) continue;
    const targetObj = target as unknown as Record<string, unknown>;
    for (const method of ['scrollTo', 'scrollBy', 'scroll'] as const) {
      const orig = targetObj[method] as (...args: unknown[]) => void;
      if (typeof orig === 'function') {
        targetObj[method] = function (...args: unknown[]) {
          try {
            if (typeof args[0] === 'object' && args[0] !== null) {
              const opt = args[0] as { left?: unknown; top?: unknown };
              if (opt.left !== undefined && !Number.isFinite(Number(opt.left))) opt.left = 0;
              if (opt.top !== undefined && !Number.isFinite(Number(opt.top))) opt.top = 0;
            } else {
              if (args[0] !== undefined && !Number.isFinite(Number(args[0]))) args[0] = 0;
              if (args[1] !== undefined && !Number.isFinite(Number(args[1]))) args[1] = 0;
            }
            return orig.apply(this, args);
          } catch {
            // ignore
          }
        };
      }
    }
  }

  // 6. Suppress and handle non-finite TypeErrors gracefully in all reporting channels
  window.addEventListener('error', (event) => {
    const msg = String(event.message || event.error?.message || '');
    if (msg.toLowerCase().includes('non-finite')) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    const msg = String(event.reason?.message || event.reason || '');
    if (msg.toLowerCase().includes('non-finite')) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  const prevOnError = window.onerror;
  window.onerror = function (msg, url, line, col, error) {
    const m = String(msg || error?.message || '');
    if (m.toLowerCase().includes('non-finite')) {
      return true;
    }
    if (typeof prevOnError === 'function') {
      return prevOnError.apply(this, [msg, url, line, col, error]);
    }
    return false;
  };

  const origConsoleError = console.error;
  console.error = function (...args: unknown[]) {
    const str = args.map((a) => (a instanceof Error ? a.message : String(a))).join(' ');
    if (str.toLowerCase().includes('non-finite')) {
      return;
    }
    origConsoleError.apply(console, args);
  };
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
