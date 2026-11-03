// Height of the public navbar. Landing sections use it too, so a link to a
// section scrolls it just below the sticky navbar.
export const NAVBAR_HEIGHT = { xs: 56, md: 60 };

// On wide screens each landing section fills one screen below the navbar, so a
// section is seen whole without scrolling inside it.
export const SCREEN_HEIGHT = `calc(100svh - ${NAVBAR_HEIGHT.md}px)`;
