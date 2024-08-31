#!/bin/bash

PROTO_DIR=infra/proto/src/proto
OUT_DIR=infra/proto/src/generated

# format proto files

# Generate JavaScript and TypeScript files from proto files
rm -rf $OUT_DIR
mkdir -p $OUT_DIR
./node_modules/.bin/grpc_tools_node_protoc \
    --plugin="protoc-gen-ts=./node_modules/.bin/protoc-gen-ts_proto" \
    --ts_out=$OUT_DIR \
    $PROTO_DIR/*.proto

mv $OUT_DIR/$PROTO_DIR/* $OUT_DIR
rm -rf $OUT_DIR/infra

# --js_out=import_style=commonjs,binary:$OUT_DIR
