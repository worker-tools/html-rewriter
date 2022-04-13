PACKAGE_NAME := $(shell basename $(shell pwd))
# PACKAGE_VERSION := $(shell git describe --tags --abbrev=0)

mk-wasm:
	cd ./html-rewriter-wasm; make dist

cp-wasm: mk-wasm
	cp ./html-rewriter-wasm/html_rewriter* ./vendor 
	cp ./html-rewriter-wasm/asyncify.js ./vendor

base64: cp-wasm
	./scripts/make_64.ts

dist: base64

npm: dist
	./scripts/build_npm.ts
