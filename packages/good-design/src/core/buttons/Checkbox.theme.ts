export const theme = {
  variants: {
    "styled-blue": () => ({
      _web: {
        cursor: "auto"
      },
      _stack: {
        _web: {
          cursor: "auto"
        }
      },
      _disabled: {
        _web: {
          cursor: "auto"
        },
        opacity: 1
      },
      _checked: {
        borderColor: "gdPrimary",
        bg: "gdPrimary",
        _hover: {
          borderColor: "gdPrimary",
          bg: "gdPrimary",
          _disabled: {
            borderColor: "gdPrimary",
            bg: "gdPrimary"
          }
        }
      }
    })
  }
};
