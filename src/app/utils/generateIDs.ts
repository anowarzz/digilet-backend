export const getWalletId = (name = "ZZZ") => {
  //  slice the name to have 3 first letter
  const nameSlice = name.slice(0, 3).toUpperCase();
  const now = new Date();
  const timeSlice = `${now.getHours()}${now.getMinutes()}${now.getSeconds()}${now.getMilliseconds()}`;


  return `WLT-${nameSlice}${timeSlice}${Math.floor(Math.random() * 1000)}`;
};
