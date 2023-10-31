# CPTA

TA Kit for Computer Programming.

## File Structure

```sh
.
├── .works
|   └── <student-id>
|       ├── 0-raw
|       ├── 1-build
|       ├── 2-output
|       └── 3-result
├-- .build
|   └── mount
|       └ ... (files to be mounted before build)
└── .cases
    └── <case-name>
        ├── mount
        |   └ ... (files to be mounted before execution)
        ├── exec.js
        └── spec.js
```

## Usage

### Create workspace from Moodle archive

```sh
cpta from-moodle <moodle-archive> --output [output-dir]
```

`output-dir` defaults to `./.works`.

### Build all workspaces

```sh
cpta make --workspace [workspaces-dir]
```

`workspaces-dir` defaults to `./.works`.

### Execute all targets in workspaces

```sh
cpta exec --workspace [workspaces-dir] --case [cases-dir]
```

`workspaces-dir` defaults to `./.works`.
`cases-dir` defaults to `./.cases`.

### Evaluate all targets in workspaces

```sh
cpta eval --workspace [workspaces-dir] --case [cases-dir]
```

`workspaces-dir` defaults to `./.works`.
`cases-dir` defaults to `./.cases`.

### Make report from workspaces

```sh
cpta report
```

### Dive into workspaces in container

```sh
cpta dive
```
