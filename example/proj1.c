#include <stdio.h>

int main(int argc, char ** argv) {
    if(argc == 2) {
        printf("%s\n", argv[1]);
    } else if(argc == 3) {
        fprintf(stderr, "error :(\n");
        return 1;
    } else {
        int c = getchar();
        printf("%c\n", c);
    }

    return 0;
}
