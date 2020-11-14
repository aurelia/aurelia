export interface IEntity {
  id: number;
  clone(): IEntity;
}

export interface IRepository<TEntity extends IEntity> {
  createRandom(): TEntity;
  create(entity?: TEntity): void;
  all(): TEntity[];
  find(id: number): TEntity | undefined;
  update(id: number, entity: TEntity): void;
  delete(id: number): void;
}
