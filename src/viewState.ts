///<reference path="colorSchemes.ts" />

class ViewState {
    private constructor(
        readonly colorScheme: number,
        readonly maxIterations: number,
        readonly position: { x: number; y: number; },
        readonly scale: number
    ) {
    }

    static getCurrent(): ViewState {
        const urlParams = new URLSearchParams(location.search.substr(1));

        return new ViewState(
            safeParseInt(urlParams.get('colorScheme'), 0) % colorSchemes.length,
            safeParseInt(urlParams.get('maxIter'), 50),
            {
                x: safeParseFloat(urlParams.get('x'), -0.5),
                y: safeParseFloat(urlParams.get('y'), 0)
            },
            safeParseFloat(urlParams.get('scale'), 4)
        );
    }

    canvasToWorld(canvasPos: Point, canvasSize: Size): Point {
        const aspectRatio = canvasSize.height / canvasSize.width;
        const x = (canvasPos.x / canvasSize.width - 0.5) * this.scale;
        const y = (canvasPos.y / canvasSize.height - 0.5) * this.scale * aspectRatio;

        return {
            x: x + this.position.x,
            y: y + this.position.y
        }
    }

    toURLSearchParams(): URLSearchParams {
        return new URLSearchParams({
            x: this.position.x.toString(),
            y: this.position.y.toString(),
            scale: this.scale.toString(),
            maxIter: this.maxIterations.toString(),
            colorScheme: this.colorScheme.toString()
        });
    }

    withPosAndScale(position: { x: number; y: number; }, scale: number): ViewState {
        return new ViewState(
            this.colorScheme,
            this.maxIterations,
            position,
            scale
        );
    }
}

function safeParseInt(value: string | null, defaultValue: number) {
    return value ? parseInt(value, 10) : defaultValue;
}

function safeParseFloat(value: string | null, defaultValue: number) {
    return value ? parseFloat(value) : defaultValue;
}
