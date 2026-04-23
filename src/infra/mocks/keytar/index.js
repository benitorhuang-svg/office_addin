module.exports = {
  getPassword: (_service, _account) => Promise.resolve(null),
  setPassword: (_service, _account, _password) => Promise.resolve(),
  deletePassword: (_service, _account) => Promise.resolve(true),
  findPassword: (_service) => Promise.resolve(null),
  findCredentials: (_service) => Promise.resolve([]),
};
