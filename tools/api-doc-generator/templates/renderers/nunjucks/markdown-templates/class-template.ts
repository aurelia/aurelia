export const classTemplate = `
{% if comment %}
    # 🕮 Summary
    {{ comment | commentRenderer }}
{% endif %}
<br/>
# {{ name | replaceWith }}
| Modifier(s)                            | Extends                      | Implements                                    |
|----------------------------------------|------------------------------|-----------------------------------------------|
| {{ modifiers | join(', ','declare') }} | {{ extends | typeRenderer }} | {{ implements | typesRenderer | join(', ') }} |
<br/>
{% if typeParameters %}
    # 🌟 Type Parameter(s)
    {% for tp in typeParameters %}
        {{ tp | typeParameterRenderer }}
        <br/>
    {% endfor %}
{% endif %}
{% if decorators %}
    # 🌟 Decorators(s)
    {% for d in decorators %}
        {{ d | decoratorRenderer }}
        <br/>
    {% endfor %}
{% endif %}
{% if constructors %}
    # 🌟 Constructor(s)
    {% for c in constructors %}
        | Parameter-less                         | Implementation                          | Overload                          |
        |:--------------------------------------:|:---------------------------------------:|:---------------------------------:|
        | {{ c.isParameterLess | print_symbol }} | {{ c.isImplementation | print_symbol }} | {{ c.isOverload | print_symbol }} |
        <br/>
        {% if c.parameters %}
            **✦ Parameter(s)**
            <br/>
            {% for p in c.parameters %}
                {% if p.decorators %}
                    **Decorator(s)**
                    <br/>
                    {% for de in p.decorators %}
                        {{ de | decoratorRenderer }}
                        <br/>
                    {% endfor %}
                {% endif %}
                _**{{ p.name }}**_
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
    # 🌟 Property(ies)
    {% for pr in properties %}
        {% if pr.comment %}
            ### 🕮 Summary
            {{ pr.comment | commentRenderer }}
        {% endif %}
        {% if pr.decorators %}
            ### ✦ Decorators(s)
            {% for d in pr.decorators %}
                {{ d | decoratorRenderer }}
                <br/>
            {% endfor %}
        {% endif %}
        ## {{ pr.name }}
        | Modifier(s)                               | Optional                           | Type                        | Initializer                       |
        |-------------------------------------------|:----------------------------------:|-----------------------------|-----------------------------------|
        | {{ pr.modifiers | join(', ','declare') }} | {{ pr.isOptional | print_symbol }} | {{ p.type | typeRenderer }} | {{ p.initializer | replaceWith }} |
        <br/>   
    {% endfor %}
{% endif %}
{% if getAccessors %}
    # 🌟 Get Accessor(s)
    {% for g in getAccessors %}
        {% if g.comment %}
            ### 🕮 Summary
            {{ g.comment | commentRenderer }}
        {% endif %}
        {% if g.typeParameters %}
            ### ✦ Type Parameter(s)
            {% for tp in g.typeParameters %}
                {{ tp | typeParameterRenderer }}
                <br/>
            {% endfor %}
        {% endif %}
        {% if g.decorators %}
            ### ✦ Decorators(s)
            {% for d in g.decorators %}
                {{ d | decoratorRenderer }}
                <br/>
            {% endfor %}
        {% endif %}
        ## {{ g.name }}
        | Modifier(s)                              | Return Type                       |
        |------------------------------------------|-----------------------------------|
        | {{ g.modifiers | join(', ','declare') }} | {{ p.returnType | typeRenderer }} |
        <br/>   
    {% endfor %}
{% endif %}
{% if setAccessors %}
    # 🌟 Set Accessor(s)
    {% for s in setAccessors %}
        {% if s.comment %}
            ### 🕮 Summary
            {{ s.comment | commentRenderer }}
        {% endif %}
        {% if s.typeParameters %}
            ### ✦ Type Parameter(s)
            {% for tp in s.typeParameters %}
                {{ tp | typeParameterRenderer }}
                <br/>
            {% endfor %}
        {% endif %}
        {% if s.decorators %}
            ### ✦ Decorators(s)
            {% for d in s.decorators %}
                {{ d | decoratorRenderer }}
                <br/>
            {% endfor %}
        {% endif %}
        ## {{ s.name }}
        | Modifier(s)                              | Return Type                       |
        |------------------------------------------|-----------------------------------|
        | {{ s.modifiers | join(', ','declare') }} | {{ p.returnType | typeRenderer }} |
        <br/>
        {% if s.parameters %}
            ### ✦ Parameter(s)
            {% for p in s.parameters %}
                _**{{ p.name }}**_
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
    # 🌟 Method(s)
    {% for m in methods %}
        {% if m.comment %}
            ### 🕮 Summary
            {{ m.comment | commentRenderer }}
        {% endif %}
        {% if m.typeParameters %}
            ### ✦ Type Parameter(s)
            {% for tp in m.typeParameters %}
                {{ tp | typeParameterRenderer }}
                <br/>
            {% endfor %}
        {% endif %}
        {% if m.decorators %}
            ### ✦ Decorators(s)
            {% for d in m.decorators %}
                {{ d | decoratorRenderer }}
                <br/>
            {% endfor %}
        {% endif %}
        ## {{ m.name }}
        | Modifier(s)                              | Generator                          | Return Type                       |
        |------------------------------------------|:----------------------------------:|-----------------------------------|
        | {{ m.modifiers | join(', ','declare') }} | {{ m.isGenerator | print_symbol }} | {{ m.returnType | typeRenderer }} |        
        <br/>
        {% if m.parameters %}
            **✦ Parameter(s)**
            <br/>
            {% for p in m.parameters %}
                {% if p.decorators %}
                    **Decorator(s)**
                    <br/>
                    {% for d in p.decorators %}
                        {{ d | decoratorRenderer }}
                        <br/>
                    {% endfor %}
                {% endif %}
                _**{{ p.name }}**_
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
