export const useLocalStorage = (key,type,valueToStore) => {
    if (type === 'set') {
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } else if (type === 'get') {
      return JSON.parse(window.localStorage.getItem(key))
    }
  }
//   useLocalStorage("theme", "set", "default_theme");
// useLocalStorage(
//     "theme",
//     "set",
//     loginData?.payload?.data?.userDetails?.themeName
//   );