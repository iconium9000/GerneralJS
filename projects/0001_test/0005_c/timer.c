// read ASCII password (Unicode not supported)

// uses source code from the example in section 17.7 of the GNU C Library Reference Manual,
// however that example seems to have a bug that I have corrected (I use write instead
// of putchar as otherwise non-canonical mode does not work)

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <termios.h>
#include <ctype.h>


/* Use this variable to remember original terminal attributes. */
struct termios saved_attributes;

void
reset_input_mode (void)
{
  tcsetattr (STDIN_FILENO, TCSANOW, &saved_attributes);
}

void
set_input_mode (void)
{
  struct termios tattr;
  char *name;

/* Make sure stdin is a terminal. */
  if (!isatty (STDIN_FILENO))
    {
      fprintf (stderr, "Not a terminal.\n");
      exit (EXIT_FAILURE);
    }

/* Save the terminal attributes so we can restore them later. */
  tcgetattr (STDIN_FILENO, &saved_attributes);
  atexit (reset_input_mode);

/* Set the funny terminal modes. */
  tcgetattr (STDIN_FILENO, &tattr);
  tattr.c_lflag &= ~(ICANON | ECHO);	/* Clear ICANON and ECHO. */
  tattr.c_cc[VMIN] = 1;
  tattr.c_cc[VTIME] = 0;
  tcsetattr (STDIN_FILENO, TCSAFLUSH, &tattr);
}

int
main ()
{
  int i = 0;
  char c, password[100], asterisk = '*';


  set_input_mode ();

  while (read (STDIN_FILENO, &c, 1) && (isalnum (c) || ispunct (c))
	 && i < sizeof (password) - 2)
    {
      password[i++] = c;
      write (STDOUT_FILENO, &asterisk, 1);
    }

  password[i] = 0;

  printf ("\nPassword was: [%s]\n", password);

  return EXIT_SUCCESS;
}
