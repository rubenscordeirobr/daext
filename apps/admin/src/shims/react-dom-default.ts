import * as ReactDOM from 'react-dom';

type ReactDomCompat = typeof ReactDOM & {
    default?: typeof ReactDOM;
    findDOMNode?: typeof ReactDOM.findDOMNode;
};

const reactDomAny = ReactDOM as ReactDomCompat;

const findDOMNodePolyfill = (instance: unknown): Element | Text | null => {
    if (!instance) {
        return null;
    }

    // Direct DOM node (common case with refs on host elements)
    if (instance instanceof Element || instance instanceof Text) {
        return instance;
    }

    // React ref object
    if (typeof instance === 'object' && 'current' in (instance as Record<string, unknown>)) {
        const current = (instance as { current: unknown }).current;
        return findDOMNodePolyfill(current);
    }

    // Legacy components exposing getDOMNode or base (e.g. preact compat)
    const candidate = instance as {
        getDOMNode?: () => Element | Text | null;
        base?: Element | Text;
    };
    if (typeof candidate.getDOMNode === 'function') {
        return candidate.getDOMNode();
    }
    if (candidate.base instanceof Element || candidate.base instanceof Text) {
        return candidate.base;
    }

    return null;
};

if (!reactDomAny.default) {
    reactDomAny.default = ReactDOM as typeof ReactDOM;
}

reactDomAny.findDOMNode = findDOMNodePolyfill;
reactDomAny.default.findDOMNode = findDOMNodePolyfill;

export {};
