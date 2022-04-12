PACKAGE_NAME := $(shell basename $(shell pwd))
PACKAGE_VERSION := $(shell git describe --tags --abbrev=0)

wasm:
	cd ./html-rewriter-wasm; make dist

postinstall: wasm
	cp ./html-rewriter-wasm/html_rewriter* ./vendor/wasm 
	cp ./html-rewriter-wasm/asyncify.js ./vendor/wasm

base64: postinstall
	./bin/make-64.ts

# base128:
# 	./bin/base128.ts ./src/html_rewriter_bg.wasm | ./bin/into.ts 'FOOBAR' ./src/html-rewriter-128.ts