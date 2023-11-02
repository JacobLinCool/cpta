#include <stdio.h>

int main() {
  printf("I am ");
  printf("\033[0;31m");
  printf("RED");
  printf("\033[0m");
  printf("!\n");
  return 0;
}
