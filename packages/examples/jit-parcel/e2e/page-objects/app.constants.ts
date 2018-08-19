// tslint:disable:typedef
export class AppConstants {
  public static get cssSelectors() {
    return {
      descriptionInput: '#description',
      countInput: '#count',
      logInput: '#log',
      addTodoButton: '#addTodo',
      clearTodosButton: '#clearTodos',
      toggleTodosButton: '#toggleTodos',
      descriptionText: '#descriptionText',
      todoElements: '.todo',
      todoContentElements: '.todo .content',
      todoElement: (id: number) => `#todo-${id}`,
      todoDoneCheckbox: (id: number) => `#todo-${id}-done`
    };
  }
}
