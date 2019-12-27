export const classTemplate = `
# {{ name | mdEscape | replaceWith }}
<br/>
{% if comment %}
    ## ✦ Summary
    {{ comment | commentRenderer }}
{% endif %}
<br/>
| Modifier(s)                            | Extends                      | Implements                                    |
|----------------------------------------|------------------------------|-----------------------------------------------|
| {{ modifiers | join(', ','declare') }} | {{ extends | typeRenderer }} | {{ implements | typesRenderer | join(', ') }} |
<br/>
{% if typeParameters %}
    ## ✦ Type Parameter(s)
    {% for tp in typeParameters %}
        {{ tp | typeParameterRenderer }}
        <br/>
    {% endfor %}
{% endif %}
{% if decorators %}
    ## ✦ Decorator(s)
    {% for d in decorators %}
        {{ d | decoratorRenderer }}
        <br/>
    {% endfor %}
{% endif %}
{% if constructors %}
    ## ✦ Constructor(s)
    {% for c in constructors %}
        | Parameter-less                         | Implementation                          | Overload                          |
        |:--------------------------------------:|:---------------------------------------:|:---------------------------------:|
        | {{ c.isParameterLess | print_symbol }} | {{ c.isImplementation | print_symbol }} | {{ c.isOverload | print_symbol }} |
        <br/>
        {% if c.parameters %}
            &nbsp;&nbsp;**Parameter(s)**
            <br/>
            {% for p in c.parameters %}
                {% if p.decorators %}
                    &nbsp;&nbsp;&nbsp;&nbsp;**Decorator(s)**
                    <br/>
                    {% for de in p.decorators %}
                        {{ de | decoratorRenderer }}
                        <br/>
                    {% endfor %}
                {% endif %}
                &nbsp;&nbsp;&nbsp;&nbsp;_**{{ p.name | mdEscape }}**_
                <br/>
                | Type                        | Optional                           | Rest                          | Parameter Property                          |
                |-----------------------------|:----------------------------------:|:-----------------------------:|:-------------------------------------------:|
                | {{ p.type | typeRenderer }} | {{ p.isOptional | print_symbol }}  | {{ p.isRest | print_symbol }} | {{ p.isParameterProperty  | print_symbol }} |            
                <br/>
            {% endfor %}
        {% endif %}
    {% endfor %}
{% endif %}
{% if properties %}
    ## ✦ Property(ies)
    {% for pr in properties %}
        &nbsp;&nbsp; **{{ pr.name | mdEscape }}**
        <br/>
        {% if pr.comment %}
            &nbsp;&nbsp;&nbsp;&nbsp; **Summary**
            &nbsp;&nbsp;&nbsp;&nbsp; {{ pr.comment | commentRenderer }}
        {% endif %}
        {% if pr.decorators %}
            &nbsp;&nbsp;&nbsp;&nbsp; **Decorator(s)**
            {% for d in pr.decorators %}
                {{ d | decoratorRenderer }}
                <br/>
            {% endfor %}
        {% endif %}
        | Modifier(s)                               | Optional                           | Type                        | Initializer                       |
        |-------------------------------------------|:----------------------------------:|-----------------------------|-----------------------------------|
        | {{ pr.modifiers | join(', ','declare') }} | {{ pr.isOptional | print_symbol }} | {{ p.type | typeRenderer }} | {{ p.initializer | replaceWith }} |
        <br/>   
    {% endfor %}
{% endif %}
{% if getAccessors %}
    ## ✦ Get Accessor(s)
    {% for g in getAccessors %}
        &nbsp;&nbsp; **{{ g.name | mdEscape }}**
        <br/>
        {% if g.comment %}
            &nbsp;&nbsp;&nbsp;&nbsp; **Summary**
            &nbsp;&nbsp;&nbsp;&nbsp; {{ g.comment | commentRenderer }}            
            <br/>
        {% endif %}
        {% if g.typeParameters %}
            &nbsp;&nbsp;&nbsp;&nbsp; **Type Parameter(s)**
            {% for tp in g.typeParameters %}
                {{ tp | typeParameterRenderer }}
                <br/>
            {% endfor %}
        {% endif %}
        {% if g.decorators %}
            &nbsp;&nbsp;&nbsp;&nbsp; **Decorator(s)**
            {% for d in g.decorators %}
                {{ d | decoratorRenderer }}
                <br/>
            {% endfor %}
        {% endif %}
        | Modifier(s)                              | Return Type                       |
        |------------------------------------------|-----------------------------------|
        | {{ g.modifiers | join(', ','declare') }} | {{ p.returnType | typeRenderer }} |
        <br/>   
    {% endfor %}
{% endif %}
{% if setAccessors %}
    ## ✦ Set Accessor(s)
    {% for s in setAccessors %}
        &nbsp;&nbsp; **{{ s.name | mdEscape }}**
        <br/>
        {% if s.comment %}
            &nbsp;&nbsp;&nbsp;&nbsp; **Summary**
            &nbsp;&nbsp;&nbsp;&nbsp; {{ s.comment | commentRenderer }}
            <br/>
        {% endif %}
        {% if s.typeParameters %}
            &nbsp;&nbsp;&nbsp;&nbsp; **Type Parameter(s)**
            {% for tp in s.typeParameters %}
                {{ tp | typeParameterRenderer }}
                <br/>
            {% endfor %}
        {% endif %}
        {% if s.decorators %}
            &nbsp;&nbsp;&nbsp;&nbsp; **Decorator(s)**
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
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **Parameter(s)**
            {% for p in s.parameters %}
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; _**{{ p.name | mdEscape }}**_
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
    ## ✦ Method(s)
    {% for m in methods %}
    &nbsp;&nbsp; {{ m.name | mdEscape }}
        {% if m.comment %}
            &nbsp;&nbsp;&nbsp;&nbsp; **Summary**
            &nbsp;&nbsp;&nbsp;&nbsp; {{ m.comment | commentRenderer }}
            <br/>
        {% endif %}
        {% if m.typeParameters %}
            &nbsp;&nbsp;&nbsp;&nbsp; **Type Parameter(s)**
            {% for tp in m.typeParameters %}
                {{ tp | typeParameterRenderer }}
                <br/>
            {% endfor %}
        {% endif %}
        {% if m.decorators %}
            &nbsp;&nbsp;&nbsp;&nbsp; **Decorator(s)**
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
            &nbsp;&nbsp;&nbsp;&nbsp; **Parameter(s)**
            <br/>
            {% for p in m.parameters %}
                {% if p.decorators %}
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **Decorator(s)**
                    <br/>
                    {% for d in p.decorators %}
                        {{ d | decoratorRenderer }}
                        <br/>
                    {% endfor %}
                {% endif %}
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; _**{{ p.name | mdEscape }}**_
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
