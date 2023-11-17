# refractal
WebGL fractal renderer

Available at: https://decklynkern.github.io/refractal

This is a long-term project of mine to create the best fractal renderer available online.
It is intended to be:
- Fast
  - Uses WebGL for GPU-level performance
  - Shaders make heavy use of the preprocessor to only compute what is necessary and minimize branches
- Easy to use
  - Automatic redraw of the canvas (and recompilation if necessary) when parameters are tweaked
  - Settings are organized by category for each fractal type
- Feature-loaded
  - Currently 5 different fractal "programs" supported
    - Escape Time (Mandelbrot, Burning ship, Julia set, etc.)
    - Lyapunov (AKA Markus-Lyapunov if that's your thing)
    - Root Finding (Newton, Halley, etc.)
    - Recursive
    - Pendulum
  - Plently of knobs and switches to play with
  - If a feature isn't available, chances are I am thinking or have thought of adding it
