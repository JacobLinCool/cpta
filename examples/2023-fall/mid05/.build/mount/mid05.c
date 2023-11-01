#include <assert.h>
#include <inttypes.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "weight.h"

// Returns -1 when girl_weight is not initialized.
void test_girl_weight_not_initialized() {
    setup_boy_weight(50);

    int32_t x = 5;
    int32_t y = 2;
    int64_t result = afford_weight(x, y);

    if (result == -1) {
        printf("%s passed.\n", __func__);
    } else {
        printf("%s should be -1, but got %" PRId64 ".\n", __func__, result);
    }
}

// Returns -1 when boy_weight is not initialized.
void test_boy_weight_not_initialized() {
    setup_girl_weight(50);

    int32_t x = 5;
    int32_t y = 2;
    int64_t result = afford_weight(x, y);

    if (result == -1) {
        printf("%s passed.\n", __func__);
    } else {
        printf("%s should be -1, but got %" PRId64 ".\n", __func__, result);
    }
}

// Returns -1 when x is negative.
void test_x_negative() {
    setup_boy_weight(50);
    setup_girl_weight(50);

    int32_t x = -5;
    int32_t y = 2;
    int64_t result = afford_weight(x, y);

    if (result == -1) {
        printf("%s passed.\n", __func__);
    } else {
        printf("%s should be -1, but got %" PRId64 ".\n", __func__, result);
    }
}

// Returns -1 when y is negative.
void test_y_negative() {
    setup_boy_weight(50);
    setup_girl_weight(50);

    int32_t x = 5;
    int32_t y = -2;
    int64_t result = afford_weight(x, y);

    if (result == -1) {
        printf("%s passed.\n", __func__);
    } else {
        printf("%s should be -1, but got %" PRId64 ".\n", __func__, result);
    }
}

// Returns -1 when y is greater than x.
void test_y_greater_than_x() {
    setup_boy_weight(50);
    setup_girl_weight(50);

    int32_t x = 5;
    int32_t y = 6;
    int64_t result = afford_weight(x, y);

    if (result == -1) {
        printf("%s passed.\n", __func__);
    } else {
        printf("%s should be -1, but got %" PRId64 ".\n", __func__, result);
    }
}

// Returns 0 when both inputs are 0.
void test_toppest() {
    setup_boy_weight(50);
    setup_girl_weight(50);

    int32_t x = 0;
    int32_t y = 0;
    int64_t result = afford_weight(x, y);

    if (result == 0) {
        printf("%s passed.\n", __func__);
    } else {
        printf("%s should be 0, but got %" PRId64 ".\n", __func__, result);
    }
}

// Returns the half of the toppest one.
void test_1_1() {
    setup_boy_weight(30);
    setup_girl_weight(40);

    int32_t x = 1;
    int32_t y = 1;
    int64_t expected = 40 / 2;
    int64_t result = afford_weight(x, y);

    if (result == expected) {
        printf("%s passed.\n", __func__);
    } else {
        printf("%s should be %" PRId64 ", but got %" PRId64 ".\n", __func__, expected, result);
    }
}

// Returns combined weight of x boys and y girls.
void test_combined_weight() {
    uint32_t b = 50, g = 40;
    setup_boy_weight(b);
    setup_girl_weight(g);

    int32_t x = 3;
    int32_t y = 2;
    int64_t expected = (((((g / 2.0) + b) / 2.0) + (((g / 2.0) + b) / 2.0) + g) / 2.0) +
                       (((((g / 2.0) + b) / 2.0) + g) / 2.0);
    int64_t result = afford_weight(x, y);

    if (result == expected) {
        printf("%s passed.\n", __func__);
    } else {
        printf("%s should be %" PRId64 ", but got %" PRId64 ".\n", __func__, expected, result);
    }
}

// Tests with left edge.
void test_left_edge() {
    uint32_t b = 50, g = 40;
    setup_boy_weight(b);
    setup_girl_weight(g);

    int32_t x = 3;
    int32_t y = 0;
    int64_t expected = 0 + (((((g / 2.0) + b) / 2.0) + g) / 2.0);
    int64_t result = afford_weight(x, y);

    if (result == expected) {
        printf("%s passed.\n", __func__);
    } else {
        printf("%s should be %" PRId64 ", but got %" PRId64 ".\n", __func__, expected, result);
    }
}

// Tests with right edge.
void test_right_edge() {
    uint32_t b = 50, g = 40;
    setup_boy_weight(b);
    setup_girl_weight(g);

    int32_t x = 3;
    int32_t y = 3;
    int64_t expected = (((((g / 2.0) + b) / 2.0) + g) / 2.0) + 0;
    int64_t result = afford_weight(x, y);

    if (result == expected) {
        printf("%s passed.\n", __func__);
    } else {
        printf("%s should be %" PRId64 ", but got %" PRId64 ".\n", __func__, expected, result);
    }
}

int main() {
    int test = -1;
    scanf("%d", &test);

    switch (test) {
        case 1:
            test_boy_weight_not_initialized();
            break;
        case 2:
            test_girl_weight_not_initialized();
            break;
        case 3:
            test_x_negative();
            break;
        case 4:
            test_y_negative();
            break;
        case 5:
            test_y_greater_than_x();
            break;
        case 6:
            test_toppest();
            break;
        case 7:
            test_1_1();
            break;
        case 8:
            test_combined_weight();
            break;
        case 9:
            test_left_edge();
            break;
        case 10:
            test_right_edge();
            break;
        default:
            printf("Unknown test case.\n");
            break;
    }

    return EXIT_SUCCESS;
}
