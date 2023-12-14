# Testing Value Converters

Value converters in Aurelia 2 are an essential feature that allows you to create custom logic to transform data for display in your views. When it comes to testing value converters, you should aim for a mix of unit and integration tests to ensure that they function correctly both in isolation and when integrated within a view.

## Example Value Converter

Let's start with a simple value converter that transforms a string to uppercase:

{% code title="to-uppercase.ts" %}
```typescript
import { valueConverter } from 'aurelia';

@valueConverter('toUpper')
export class ToUpper {
    toView(value: string): string {
        return value ? value.toUpperCase() : value;
    }
}
```
{% endcode %}

This value converter checks if the input is a string and, if so, transforms it to uppercase. If the input is null or undefined, it simply returns the input without modification.

## Writing Tests for Value Converters

When testing value converters, we will create unit tests to validate the converter logic and integration tests to ensure the converter works as expected within an Aurelia view.

### Setting Up the Test Environment

Before writing tests, make sure to set up the test environment as described in the [Overview Section](developer-guides/testing/overview.md).

### Test Implementation

Create a test file for your value converter, such as `to-uppercase.spec.ts`. Here we will write tests for both unit and integration scenarios.

{% code title="to-uppercase.spec.ts" %}
```typescript
import { createFixture } from '@aurelia/testing';
import { ToUpper } from './to-upper';
import { bootstrapTestEnvironment } from './path-to-your-initialization-code';

describe('ToUpper value converter', () => {
    let sut: ToUpper;

    beforeAll(() => {
        // Initialize the test environment before running the tests
        bootstrapTestEnvironment();
        sut = new ToUpper();
    });

    // Unit Tests
    it('returns null for null input', () => {
        expect(sut.toView(null)).toBeNull();
    });

    it('transforms provided string to uppercase', () => {
        expect(sut.toView('rOb wAs hErE')).toBe('ROB WAS HERE');
    });

    it('transforms provided string containing numbers to uppercase', () => {
        expect(sut.toView('rob is here 123')).toBe('ROB IS HERE 123');
    });

    // Integration Test
    it('works within a view', async () => {
        const { appHost, startPromise, tearDown } = createFixture(
            '<div>${text | toUpper}</div>',
            class App {
                text = 'rob is here 123';
            },
            [ToUpper]
        );

        await startPromise;

        expect(appHost.textContent).toBe('ROB IS HERE 123');

        await tearDown();

        expect(appHost.textContent).toBe('');
    });
});
```
{% endcode %}

In the unit tests, we instantiate the `ToUpper` value converter and directly call its `toView` method with different inputs to verify the output. We test with null, a valid string, and a string with numbers to cover various scenarios.

The integration test uses the `createFixture` function to test the value converter within an Aurelia view. We define a mock component with a `text` property bound to the view and apply the `toUpper` value converter. We then assert that the rendered text content is transformed as expected.

{% hint style="info" %}
Good tests cover a range of scenarios, including expected successes, expected failures, and edge cases. This comprehensive approach ensures your value converter handles all types of inputs gracefully.
{% endhint %}

This method of testing can be applied to any class-based code in Aurelia 2. While the fixture bootstrap functionality is excellent for testing component output and behavior, it's not always necessary for unit testing pure code logic.

## Conclusion

Testing value converters is an essential step in ensuring the reliability and robustness of your Aurelia 2 applications. By writing both unit and integration tests, you can confidently verify that your value converters perform correctly in isolation and within the context of an Aurelia view.
