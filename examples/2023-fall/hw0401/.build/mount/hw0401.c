#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

#include "mysort.h"

char *match(int32_t array[], int32_t size, int32_t expected[]) {
  int8_t ok = 1;
  for (int32_t i = 0; i < size; i++) {
    if (array[i] != expected[i]) {
      ok = 0;
      break;
    }
  }

  if (ok) {
    return NULL;
  } else {
    char *msg = malloc(1024 * 1024);
    char *msg_ptr = msg;
    int32_t sz = size > 10 ? 10 : size;
    msg_ptr += sprintf(msg_ptr, "Expected: [ ");
    for (int32_t i = 0; i < sz; i++) {
      msg_ptr += sprintf(msg_ptr, "%5d ", expected[i]);
    }
    if (size > 10) {
      msg_ptr += sprintf(msg_ptr, "... ");
    }
    msg_ptr += sprintf(msg_ptr, "]\n");
    msg_ptr += sprintf(msg_ptr, "Actual: [ ");
    for (int32_t i = 0; i < sz; i++) {
      msg_ptr += sprintf(msg_ptr, "%5d ", array[i]);
    }
    if (size > 10) {
      msg_ptr += sprintf(msg_ptr, "... ");
    }
    msg_ptr += sprintf(msg_ptr, "]\n");
    return msg;
  }
}

void test_sort_simple() {
  int32_t array[] = {2, 5, 4, 3, 6, 1};
  int32_t expected[] = {6, 4, 2, 1, 3, 5};
  int32_t size = sizeof(array) / sizeof(array[0]);

  mysort(array, size);

  char *err = match(array, size, expected);
  if (err) {
    printf("%s failed.\n%s", __func__, err);
    free(err);
  } else {
    printf("%s passed.\n", __func__);
  }
}

void test_sort_empty() {
  int32_t array[] = {};
  int32_t expected[] = {};
  int32_t size = sizeof(array) / sizeof(array[0]);

  mysort(array, size);

  char *err = match(array, size, expected);
  if (err) {
    printf("%s failed.\n%s", __func__, err);
    free(err);
  } else {
    printf("%s passed.\n", __func__);
  }
}

void test_sort_odd() {
  int32_t array[] = {1, 9, 7, 5, 3};
  int32_t expected[] = {1, 3, 5, 7, 9};
  int32_t size = sizeof(array) / sizeof(array[0]);

  mysort(array, size);

  char *err = match(array, size, expected);
  if (err) {
    printf("%s failed.\n%s", __func__, err);
    free(err);
  } else {
    printf("%s passed.\n", __func__);
  }
}

void test_sort_even() {
  int32_t array[] = {2, 4, 6, 8, 10};
  int32_t expected[] = {10, 8, 6, 4, 2};
  int32_t size = sizeof(array) / sizeof(array[0]);

  mysort(array, size);

  char *err = match(array, size, expected);
  if (err) {
    printf("%s failed.\n%s", __func__, err);
    free(err);
  } else {
    printf("%s passed.\n", __func__);
  }
}

void test_sort_negative() {
  int32_t array[] = {-2, -5, -4, -3, -6, -1};
  int32_t expected[] = {-2, -4, -6, -5, -3, -1};
  int32_t size = sizeof(array) / sizeof(array[0]);

  mysort(array, size);

  char *err = match(array, size, expected);
  if (err) {
    printf("%s failed.\n%s", __func__, err);
    free(err);
  } else {
    printf("%s passed.\n", __func__);
  }
}

void test_sort_mixed() {
  int32_t array[] = {-2, 5, -4, 3, -6, 1};
  int32_t expected[] = {-2, -4, -6, 1, 3, 5};
  int32_t size = sizeof(array) / sizeof(array[0]);

  mysort(array, size);

  char *err = match(array, size, expected);
  if (err) {
    printf("%s failed.\n%s", __func__, err);
    free(err);
  } else {
    printf("%s passed.\n", __func__);
  }
}

void test_sort_large_array() {
  int32_t size = 100000;
  int32_t *array = calloc(size, sizeof(int32_t));
  int32_t *expected = calloc(size, sizeof(int32_t));
  expected[0] = 100000;
  expected[1] = 88888;
  expected[size - 1] = 100001;
  expected[size - 2] = 88889;
  array[0] = 100001;
  array[1] = 100000;
  array[size - 1] = 88889;
  array[size - 2] = 88888;

  mysort(array, size);

  char *err = match(array, size, expected);
  if (err) {
    printf("%s failed.\n%s", __func__, err);
    free(err);
  } else {
    printf("%s passed.\n", __func__);
  }
}

void test_sort_large_number() {
  int32_t array[] = {INT32_MAX, INT32_MIN, 0};
  int32_t expected[] = {0, INT32_MIN, INT32_MAX};
  int32_t size = sizeof(array) / sizeof(array[0]);

  mysort(array, size);

  char *err = match(array, size, expected);
  if (err) {
    printf("%s failed.\n%s", __func__, err);
    free(err);
  } else {
    printf("%s passed.\n", __func__);
  }
}

void test_print_unordered() {
  int32_t array[] = {2, 5, 4, 3, 6, 1};
  int32_t size = sizeof(array) / sizeof(array[0]);

  myprint(array, size);
}

void test_print_ordered() {
  int32_t array[] = {6, 4, 2, 1, 3, 5};
  int32_t size = sizeof(array) / sizeof(array[0]);

  myprint(array, size);
}

int main() {
  int test = -1;
  scanf("%d", &test);

  switch (test) {
  case 1:
    test_sort_simple();
    break;
  case 2:
    test_sort_empty();
    break;
  case 3:
    test_sort_odd();
    break;
  case 4:
    test_sort_even();
    break;
  case 5:
    test_sort_negative();
    break;
  case 6:
    test_sort_mixed();
    break;
  case 7:
    test_sort_large_array();
    break;
  case 8:
    test_sort_large_number();
    break;
  case 9:
    test_print_unordered();
    break;
  case 10:
    test_print_ordered();
    break;
  default:
    printf("Unknown test case.\n");
    break;
  }

  return EXIT_SUCCESS;
}
