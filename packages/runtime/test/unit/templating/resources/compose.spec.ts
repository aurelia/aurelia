import { expect } from 'chai';

describe.only('The "compose" custom element', () => {
  const subjectPossibilities = [
    {
      description: 'Template Definition',
      create() {
        return null;
      }
    },
    {
      description: 'View Factory',
      create() {
        return null;
      }
    },
    {
      description: 'Potential Renderable',
      create() {
        return null;
      }
    },
    {
      description: 'View',
      create() {
        return null;
      }
    },
    {
      description: 'Custom Element Constructor',
      create() {
        return null;
      }
    }
  ];

  const producerPossibilities = [
    {
      description: 'as a raw value',
      create(subject) { return subject; }
    },
    {
      description: 'via a Promise',
      create(subject) { return Promise.resolve(subject); }
    }
  ];

  for (let subjectPossibility of subjectPossibilities) {
    for(let producerPossibility of producerPossibilities) {
      let value = producerPossibility.create(subjectPossibility.create());

      it(`can compose a ${subjectPossibility.description} ${producerPossibility.description}`, done => {

      });

      it(`enforces the attach lifecycle of its composed ${subjectPossibility.description} ${producerPossibility.description}`, done => {

      });

      it(`adds a view at the render location when attaching a ${subjectPossibility.description} ${producerPossibility.description}`, done => {

      });

      it(`enforces the bind lifecycle of its composed ${subjectPossibility.description} ${producerPossibility.description}`, done => {

      });

      it(`enforces the detach lifecycle of its composed ${subjectPossibility.description} ${producerPossibility.description}`, done => {

      });

      it(`enforces the unbind lifecycle of its composed ${subjectPossibility.description} ${producerPossibility.description}`, done => {

      });
    }
  }
});
