#include <stdio.h>

int main() {
  printf("I am ");
  printf("\033[0;33m");
  printf("YELLOW");
  printf("\033[0m");
  printf("!\n");
  return 0;
}
