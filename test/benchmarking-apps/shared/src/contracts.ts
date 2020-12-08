export interface IEntity {
  id: number;
  selected: boolean;
  clone(): IEntity;
}

export interface IRepository<TEntity extends IEntity> {
  createRandom(): TEntity;
  create(entity?: TEntity): void;
  all(): TEntity[];
  find(id: number): TEntity | undefined;
  update(id: number, entity: TEntity): void;
  deleteById(id: number): void;
  deleteByIndex(index: number): void;
  removeAll(): void;
  select(index: number): void;
  updateEvery10th(): void;
}
