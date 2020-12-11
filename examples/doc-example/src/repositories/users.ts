export class UsersRepository {
  public data = [
    { id: 'eisenbergeffect', name: 'Rob Eisenberg' },
    { id: 'jwx', name: 'Jürgen Wenzel' },
    { id: 'shahabganji', name: 'Saeed Ganji' },
  ];

  public users() { return this.data; }
  public user(id: string) { return this.data.find((value) => value.id === id); }
}
