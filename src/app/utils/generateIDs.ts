export const getWalletId = (name = "ZZZ") => {
  const nameSlice = name.slice(0, 3).toUpperCase();
  const now = new Date();
  const timeSlice = `${now.getHours()}${now.getMinutes()}${now.getSeconds()}${now.getMilliseconds()}`;

  return `WLT-${nameSlice}${timeSlice}${Math.floor(Math.random() * 1000)}`;
};

// generate transaction id
export const getTransactionId = () => {
  return `Trx_${Date.now()}${Math.floor(Math.random() * 1000)}`;
};
