#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>

#include "mytlv.h"

size_t take(uint8_t *bytes) {
  size_t size = 0;

  while (true) {
    int32_t byte = 0;
    scanf("%X", &byte);

    if (byte == 0xFF) {
      break;
    }

    bytes[size++] = byte;
  }

  return size;
}

int main() {
  uint8_t bytes[1024];
  size_t size = take(bytes);

  int32_t result = run(bytes, size);

  if (result == -1) {
    printf("\n======\nERROR DETECTED\n");
  }

  return EXIT_SUCCESS;
}
