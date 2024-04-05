#include_next <string.h>

#ifndef I_AM_TA
#define strchr mystrchr
#define strrchr mystrrchr
#define strspn mystrspn
#define strcspn mystrcspn
#define strpbrk mystrpbrk
#define strstr mystrstr
#define strtok mystrtok
#else
#ifdef strchr
#undef strchr
#endif
#ifdef strrchr
#undef strrchr
#endif
#ifdef strspn
#undef strspn
#endif
#ifdef strcspn
#undef strcspn
#endif
#ifdef strpbrk
#undef strpbrk
#endif
#ifdef strstr
#undef strstr
#endif
#ifdef strtok
#undef strtok
#endif
#endif
