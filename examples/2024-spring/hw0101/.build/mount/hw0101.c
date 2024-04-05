#include "mystring.h"

#define I_AM_TA

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void test_strchr_found() {
  char *err = NULL;
  char *s = "hello, world!";
  char c = 'o';
  char *p = strchr(s, c);
  char *my_p = mystrchr(s, c);
  if (p != my_p) {
    err = calloc(1024, sizeof(char));
    sprintf(err, "strchr(%s, %c) = %p, mystrchr(%s, %c) = %p\n", s, c, p, s, c,
            my_p);
  }

  if (err) {
    printf("%s failed.\n%s", __func__, err);
    free(err);
  } else {
    printf("%s passed.\n", __func__);
  }
}

void test_strchr_not_found() {
  char *err = NULL;
  char *s = "hello, world!";
  char c = 'x';
  char *p = strchr(s, c);
  char *my_p = mystrchr(s, c);
  if (p != my_p) {
    err = calloc(1024, sizeof(char));
    sprintf(err, "strchr(%s, %c) = %p, mystrchr(%s, %c) = %p\n", s, c, p, s, c,
            my_p);
  }

  if (err) {
    printf("%s failed.\n%s", __func__, err);
    free(err);
  } else {
    printf("%s passed.\n", __func__);
  }
}

void test_strrchr_found() {
  char *err = NULL;
  char *s = "hello, world!";
  char c = 'o';
  char *p = strrchr(s, c);
  char *my_p = mystrrchr(s, c);
  if (p != my_p) {
    err = calloc(1024, sizeof(char));
    sprintf(err, "strrchr(\"%s\", '%c') = %p, mystrrchr(\"%s\", '%c') = %p\n",
            s, c, p, s, c, my_p);
  }

  if (err) {
    printf("%s failed.\n%s", __func__, err);
    free(err);
  } else {
    printf("%s passed.\n", __func__);
  }
}

void test_strspn() {
  char *err = NULL;
  char *s = "hello, world!";
  char *accept = "helowr !,";
  size_t p = strspn(s, accept);
  size_t my_p = mystrspn(s, accept);
  if (p != my_p) {
    err = calloc(1024, sizeof(char));
    sprintf(err,
            "strspn(\"%s\", \"%s\") = %zu, mystrspn(\"%s\", \"%s\") = %zu\n", s,
            accept, p, s, accept, my_p);
  }

  if (err) {
    printf("%s failed.\n%s", __func__, err);
    free(err);
  } else {
    printf("%s passed.\n", __func__);
  }
}

void test_strcspn_not_found() {
  char *err = NULL;
  char *s = "hello, world!";
  char *reject = ".?";
  size_t p = strcspn(s, reject);
  size_t my_p = mystrcspn(s, reject);
  if (p != my_p) {
    err = calloc(1024, sizeof(char));
    sprintf(err,
            "strcspn(\"%s\", \"%s\") = %zu, mystrcspn(\"%s\", \"%s\") = %zu\n",
            s, reject, p, s, reject, my_p);
  }

  if (err) {
    printf("%s failed.\n%s", __func__, err);
    free(err);
  } else {
    printf("%s passed.\n", __func__);
  }
}

void test_strpbrk_found() {
  char *err = NULL;
  char *s = "hello, world!";
  char *accept = "! ";
  char *p = strpbrk(s, accept);
  char *my_p = mystrpbrk(s, accept);
  if (p != my_p) {
    err = calloc(1024, sizeof(char));
    sprintf(err,
            "strpbrk(\"%s\", \"%s\") = %p, mystrpbrk(\"%s\", \"%s\") = %p\n", s,
            accept, p, s, accept, my_p);
  }

  if (err) {
    printf("%s failed.\n%s", __func__, err);
    free(err);
  } else {
    printf("%s passed.\n", __func__);
  }
}

void test_strstr_found() {
  char *err = NULL;
  char *haystack = "hello, world!";
  char *needle = "world";
  char *p = strstr(haystack, needle);
  char *my_p = mystrstr(haystack, needle);
  if (p != my_p) {
    err = calloc(1024, sizeof(char));
    sprintf(err, "strstr(\"%s\", \"%s\") = %p, mystrstr(\"%s\", \"%s\") = %p\n",
            haystack, needle, p, haystack, needle, my_p);
  }

  if (err) {
    printf("%s failed.\n%s", __func__, err);
    free(err);
  } else {
    printf("%s passed.\n", __func__);
  }
}

void test_strtok() {
  char *err = NULL;
  char *s1 = strdup("pub fn add(a: i64, b: i64) {\n\tlet c = a + b;\n\tc\n}\n");
  char *s2 = strdup(s1);
  char *delim = ",:;()\n\t ";

  char *p = strtok(s1, delim);
  char *my_p = mystrtok(s2, delim);
  int i = 0;
  while (p) {
    if (my_p == NULL || strcmp(p, my_p)) {
      err = calloc(1024, sizeof(char));
      sprintf(err, "[at token %d] strtok = \"%s\", mystrtok = \"%s\"\n", i, p,
              my_p);
      break;
    }
    p = strtok(NULL, delim);
    my_p = mystrtok(NULL, delim);
    i++;
  }

  free(s1);
  free(s2);

  if (err) {
    printf("%s failed.\n%s", __func__, err);
    free(err);
  } else {
    printf("%s passed.\n", __func__);
  }
}

int main() {
  int test = -1;
  scanf("%d", &test);

  switch (test) {
  case 1: {
    test_strchr_found();
    break;
  }
  case 2: {
    test_strchr_not_found();
    break;
  }
  case 3: {
    test_strrchr_found();
    break;
  }
  case 4: {
    test_strspn();
    break;
  }
  case 5: {
    test_strcspn_not_found();
    break;
  }
  case 6: {
    test_strpbrk_found();
    break;
  }
  case 7: {
    test_strstr_found();
    break;
  }
  case 8: {
    test_strtok();
    break;
  }
  default: {
    printf("Unknown test case.\n");
    break;
  }
  }

  return EXIT_SUCCESS;
}

#undef I_AM_TA
