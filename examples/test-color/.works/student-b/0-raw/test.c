#include <stdio.h>

int main() {
  printf("I am ");
  printf("\033[0;32m");
  printf("GREEN");
  printf("\033[0m");
  printf("!\n");
  return 0;
}
