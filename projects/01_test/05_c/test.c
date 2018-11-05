#include <stdio.h>
#include <stdlib.h>
#include <signal.h>
#include <termios.h>
#include <unistd.h>

static struct termios os, ns;
int PAUSE = 0;

void stop_echo();
void start_echo();

void pause_if_sigint(int);

int main(int ac, char* av[]) {

  stop_echo();

  signal(SIGINT, pause_if_sigint); // call f on 'CTRL-c'
	signal(SIGQUIT, pause_if_sigint); // call f on 'CTRL-\'

  int tech = 0;
  while (1) {
    // system("clear");
    // if (!PAUSE) printf("test %d\n", ++tech);
  }

  start_echo();
}

void pause_if_sigint( int signum ) {
  printf("pause %d %d\n", signum, SIGINT);
  PAUSE = signum == SIGINT;
}

void stop_echo() {
  tcgetattr(0, &os);
  tcgetattr(0, &ns);
  ns.c_lflag &= ~ECHO;
  tcsetattr(0, TCSANOW, &ns);
}
void start_echo() {
  tcsetattr(0, TCSANOW, &os);
}
