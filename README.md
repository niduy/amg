# amg

Convert images to ASCII characters

## Development

To build WASM, install `wasm-pack` and run

```sh
wasm-pack build --target web --out-dir web/wasm
```

To start the project, use any http server. e.g.

```sh
cd web
python -m http.server
```
