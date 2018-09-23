# Mandelbrot set renderer

## Examples

- https://mandelbrot.azurewebsites.net/
- https://mandelbrot.azurewebsites.net/?x=0.2523695566802841&y=-0.00018770838792352552&scale=0.00002154650261218775&maxIter=500&colorScheme=5
- https://mandelbrot.azurewebsites.net/?x=-0.5978242593448716&y=0.6630067695640269&scale=0.009986146952327564&maxIter=500&colorScheme=4
- https://mandelbrot.azurewebsites.net/?x=-0.8631592436499246&y=-0.264794008168728&scale=7.603094836129042e-11&maxIter=2000&colorScheme=4

## Controls

- Click and drag to select area
- Click selected area to zoom in
- Use browser back button to zoom out

## Query string parameters

- `x`, `y` - center position on the complex plane (default: `-0.5, 0`)
- `scale` - total width of the visible complex plane area (default: `4`)
- `maxIter` - maximum iteration count when computing pixel color (default: `50`)
- `colorScheme` - index of used color scheme (default: `0`)