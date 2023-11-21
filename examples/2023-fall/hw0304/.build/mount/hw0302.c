#include "mycontrol.h"
#include <math.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

// score 4
void return_value_test() {
  int32_t test_passed = 4;
  if (forward(1) != -1) {
    test_passed--;
  }
  if (clock_turn(1) != -1) {
    test_passed--;
  }
  if (counterclock_turn(1) != -1) {
    test_passed--;
  }
  if (print() != -1) {
    test_passed--;
  }
  printf("%d\n", test_passed);
  return;
}

// score 3
void initialize_test() {
  initialize(0, 0, M_PI * 21.5);
  print();

  initialize(999.994, -999.995, -M_PI * 21.5);
  print();

  initialize(-999.999, 999.995, 0);
  print();
}

// score 3
void forward_test() {
  initialize(2.5, -1.5, M_PI / 3);
  forward(1.5);
  print();

  initialize(2.5, -1.5, -M_PI / 4);
  forward(-3.8);
  print();

  initialize(-6.1, -2.9, M_PI / 2);
  forward(-4.7);
  print();
}

// score 3
void turn_test() {
  initialize(2.5, -1.5, M_PI / 3);
  clock_turn(M_PI / 4);
  print();

  initialize(2.5, -1.5, -M_PI / 4);
  counterclock_turn(M_PI * 3 / 4);
  print();

  initialize(-6.1, -2.9, M_PI / 2);
  clock_turn(-M_PI * (2.0 + 1.0 / 3.0));
  print();
}

// score 2
void multi_test1() {
  initialize(0, 0, 0);
  forward(1);
  clock_turn(M_PI / 2);
  forward(1);
  counterclock_turn(M_PI / 2);
  forward(1);
  clock_turn(M_PI / 2);
  forward(1);
  print();
}

// score 2
void multi_test2() {
  initialize(0, 0, 0);
  forward(-100);
  clock_turn(-M_PI * 3.14159);
  forward(99);
  counterclock_turn(-M_PI * 31.4159);
  forward(-31);
  print();
}

// score 3
void recurrsion_test(int8_t deep) {
  if (deep == 0) {
    print();
    return;
  }
  clock_turn(M_PI / 4);
  forward(deep);
  recurrsion_test(deep - 1);
  forward(-deep);
  counterclock_turn(M_PI / 2);
  forward(deep);
  recurrsion_test(deep - 1);
  clock_turn(M_PI / 4);
  forward(-deep);
  return;
}
int main() {
  return_value_test();
  initialize_test();
  forward_test();
  turn_test();
  multi_test1();
  multi_test2();
  initialize(0, 0, 0);
  recurrsion_test(3);

  return 0;
}