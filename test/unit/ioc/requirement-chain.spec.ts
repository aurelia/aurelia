import { RequirementChain } from "../../../ioc/requirement-chain";
import { IRequirement } from "../../../ioc/interfaces";
import { MockRequirement } from "./mocks";

describe('RequirementChain', () => {
  let sut: RequirementChain;
  let req1: IRequirement;
  let req2: IRequirement;
  let req3: IRequirement;

  beforeEach(() => {
    req1 = new MockRequirement(String, null);
    req2 = new MockRequirement(Number, null);
    req3 = new MockRequirement(Object, null);
  });

  it('should be in correct state when there is one requirement', () => {
    sut = RequirementChain.create(req1);

    expect(sut.previous).toBeNull();
    expect(sut.tailValue).toBe(req1);
    expect(sut.initialRequirement).toBe(req1);
    expect(sut.currentRequirement).toBe(req1);
    expect(typeof sut.key).toBe("symbol");

    expect(sut.getPreviousRequirements()).toEqual([]);
    expect(sut.toArray()).toEqual([req1]);
  });

  it('should be in correct state when there are two requirements', () => {
    const first = RequirementChain.create(req1);
    sut = first.extend(req2);

    expect(sut.previous).toBe(first);
    expect(sut.tailValue).toBe(req2);
    expect(sut.initialRequirement).toBe(req1);
    expect(sut.currentRequirement).toBe(req2);
    expect(sut.key).toBe(first.key);

    expect(sut.getPreviousRequirements()).toEqual([req1]);
    expect(sut.toArray()).toEqual([req1, req2]);
  });

  it('should be in correct state when there are three requirements', () => {
    const first = RequirementChain.create(req1);
    const second = first.extend(req2);
    sut = second.extend(req3);

    expect(sut.previous).toBe(second);
    expect(sut.tailValue).toBe(req3);
    expect(sut.initialRequirement).toBe(req1);
    expect(sut.currentRequirement).toBe(req3);
    expect(sut.key).toBe(first.key);

    expect(sut.getPreviousRequirements()).toEqual([req1, req2]);
    expect(sut.toArray()).toEqual([req1, req2, req3]);
  });

});
