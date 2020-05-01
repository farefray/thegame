export default class SessionsStore {
  private storage: Object;

  constructor() {
    this.storage = {};
  }

  store(session) {
    this.storage[session.ID] = session;
  }

  get(sessionID) {
    const session = this.storage[sessionID];
    return session || null;
  }

  keys() {
    return Object.keys(this.storage);
  }

  destroy(sessionID) {
    if (this.get(sessionID)) {
      delete this.storage[sessionID];
    }
  }

  setIn(sessionID, updateArray) {
    const session = this.get(sessionID);
    if (session) {
      session.set(updateArray[0], updateArray[1]);
    }
  }
}
