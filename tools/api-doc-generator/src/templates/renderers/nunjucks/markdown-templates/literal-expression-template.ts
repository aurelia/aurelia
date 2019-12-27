export const literalExpressionTemplate = `
## Attribute(s)
| Object                        |
|-------------------------------|
| {{ isObject | print_symbol }} |
<br/>
{% if assignments %}
    ## Assignment(s)
    {% for a in assignments %}
        {{ a | assignmentRenderer }}
        <br/>
    {% endfor %}
{% endif %}
{% if getAccessors %}
    ## Get Accessor(s)
    {% for g in getAccessors %}
        &nbsp;&nbsp;_**{{ g.name | mdEscape }}**_
        {% if g.comment %}
            &nbsp;&nbsp;&nbsp;&nbsp;**Summary**
            {{ g.comment | commentRenderer }}
        {% endif %}
        {% if g.typeParameters %}
            &nbsp;&nbsp;&nbsp;&nbsp;**Type Parameter(s)**
            {% for tp in g.typeParameters %}
                {{ tp | typeParameterRenderer }}
                <br/>
            {% endfor %}
        {% endif %}
        {% if g.decorators %}
            &nbsp;&nbsp;&nbsp;&nbsp;**Decorator(s)**
            {% for d in g.decorators %}
                {{ d | decoratorRenderer }}
                <br/>
            {% endfor %}
        {% endif %}
        <br/>
        | Modifier(s)                              | Return Type                       |
        |------------------------------------------|-----------------------------------|
        | {{ g.modifiers | join(', ','declare') }} | {{ p.returnType | typeRenderer }} |
        <br/>   
    {% endfor %}
{% endif %}
{% if setAccessors %}
    ## Set Accessor(s)
    {% for s in setAccessors %}
        &nbsp;&nbsp;_**{{ s.name | mdEscape }}**_
        {% if s.comment %}
            &nbsp;&nbsp;&nbsp;&nbsp;**Summary**
            {{ s.comment | commentRenderer }}
        {% endif %}
        {% if s.typeParameters %}
            &nbsp;&nbsp;&nbsp;&nbsp;**Type Parameter(s)**
            {% for tp in s.typeParameters %}
                {{ tp | typeParameterRenderer }}
                <br/>
            {% endfor %}
        {% endif %}
        {% if s.decorators %}
            &nbsp;&nbsp;&nbsp;&nbsp;**Decorator(s)**
            {% for d in s.decorators %}
                {{ d | decoratorRenderer }}
                <br/>
            {% endfor %}
        {% endif %}
        <br/> 
        | Modifier(s)                              | Return Type                       |
        |------------------------------------------|-----------------------------------|
        | {{ s.modifiers | join(', ','declare') }} | {{ p.returnType | typeRenderer }} |
        <br/>         
        {% if s.parameters %}
            ## &nbsp;&nbsp; Parameter(s)
            <br/> 
            {% for p in s.parameters %}
                &nbsp;&nbsp;&nbsp;&nbsp;_**{{ p.name | mdEscape }}**_
                <br/> 
                | Modifier(s)                              | Type                        |
                |------------------------------------------|-----------------------------|
                | {{ p.modifiers | join(', ','declare') }} | {{ p.type | typeRenderer }} |
                <br/> 
            {% endfor %}
        {% endif %}
    {% endfor %}
{% endif %}
{% if methods %}
    ## Method(s)
    {% for m in methods %}
        &nbsp;&nbsp;_**{{ m.name | mdEscape }}**_
        {% if m.comment %}
            &nbsp;&nbsp;&nbsp;&nbsp;**Summary**
            {{ m.comment | commentRenderer }}
        {% endif %}
        {% if m.typeParameters %}
            &nbsp;&nbsp;&nbsp;&nbsp;**Type Parameter(s)**
            {% for tp in m.typeParameters %}
                {{ tp | typeParameterRenderer }}
                <br/>
            {% endfor %}
        {% endif %}
        {% if m.decorators %}
            &nbsp;&nbsp;&nbsp;&nbsp;**Decorator(s)**
            {% for d in m.decorators %}
                {{ d | decoratorRenderer }}
                <br/>
            {% endfor %}
        {% endif %}
        <br/>
        | Modifier(s)                              | Generator                          | Return Type                       |
        |------------------------------------------|:----------------------------------:|-----------------------------------|
        | {{ m.modifiers | join(', ','declare') }} | {{ m.isGenerator | print_symbol }} | {{ m.returnType | typeRenderer }} |        
        <br/>
        {% if m.parameters %}
            &nbsp;&nbsp;&nbsp;&nbsp;**Parameter(s)** 
            <br/>
            {% for p in m.parameters %}
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;_**{{ p.name | mdEscape }}**_
                {% if p.decorators %}
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**Decorator(s)**
                    <br/>
                    {% for d in p.decorators %}
                        {{ d | decoratorRenderer }}
                        <br/>
                    {% endfor %}
                {% endif %}
                <br/> 
                | Modifier(s)                              | Type                        | Optional                           | Rest                          | Parameter Property                          | Initializer                       |
                |------------------------------------------|-----------------------------|:----------------------------------:|:-----------------------------:|:-------------------------------------------:|-----------------------------------|
                | {{ p.modifiers | join(', ','declare') }} | {{ p.type | typeRenderer }} | {{ p.isOptional | print_symbol }}  | {{ p.isRest | print_symbol }} | {{ p.isParameterProperty  | print_symbol }} | {{ p.initializer | replaceWith }} |
                <br/>
            {% endfor %}
        {% endif %}
    {% endfor %}
{% endif %}
`;
