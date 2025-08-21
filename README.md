# Virtual Try On

## To know before running the project
This project need the installation of IDM-VTON model. So, follow the instructions in the [IDM-VTON](https://github.com/yisol/IDM-VTON) repository to install and run the gradio demo of the project.

IDM-VTON needs a GPU for at least 8GB of VRAM to run if you follow these [instructions](https://github.com/yisol/IDM-VTON/issues/63) to finetune the original implementation.

## Installation
Once again, make sure that the gradio demo of the IDM-VTON is running before running this project and it has a public url. To do so, you have to set `image_blocks.launch(share=True)` in the `gradio_demo/app.py` file of the IDM-VTON project.

And last things, don't forget to change the public url of the gradio demo of the IDM-VTON in the `src/app/gradio.service.ts` file of this project in the `gradioUrl` variable.

The gradioUrl variable should be something like `https://ffe05d90ebf57db702.gradio.live`.

As a security measure, I give you an exemple of the `app.py` file of the IDM-VTON project in the root directory of this project called [`app.txt`](app.txt) which is normally already configured to run on a 8GB GPU.

To install the project, run:

```bash
npm install
```

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
