# CPTA

TA Kit for Computer Programming.

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
cpta exec --workspace [workspaces-dir] --input [input-dir]
```

`workspaces-dir` defaults to `./.works`.
`input-dir` defaults to `./.inputs`.

### Evaluate all targets in workspaces

```sh
cpta eval --workspace [workspaces-dir] --spec [spec-dir]
```

`workspaces-dir` defaults to `./.works`.
`spec-dir` defaults to `./.specs`.

### Make report from workspaces

```sh
cpta report
```

### Dive into workspaces in container

```sh
cpta dive
```
