type Parameters = {
    maxIterations: number;
    position: { x: number; y: number; };
    scale: 4;
}

function safeParseInt(value: string | null, defaultValue: number) {
    return value ? parseInt(value, 10) : defaultValue;
}

function safeParseFloat(value: string | null, defaultValue: number) {
    return value ? parseFloat(value) : defaultValue;
}

function getCurrentParameters() {
    const urlParams = new URLSearchParams(location.search.substr(1));

    return {
        maxIterations: safeParseInt(urlParams.get('maxIter'), 50),
        position: {
            x: safeParseFloat(urlParams.get('x'), -0.5),
            y: safeParseFloat(urlParams.get('y'), 0)
        },
        scale: safeParseFloat(urlParams.get('scale'), 4)
    };
}