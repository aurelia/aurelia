export const interfaceTemplate = `
{% if comment %}
    # &#128366; Summary
    {{ comment | commentRenderer }}
{% endif %}
<br/>
# {{ name | replaceWith }}
| Modifier(s)                            | Extends                                    |
|----------------------------------------|--------------------------------------------|
| {{ modifiers | join(', ','declare') }} | {{ extends | typesRenderer | join(', ') }} |
<br/>
{% if typeParameters %}
    # &#128712; Type Parameter(s)
    {% for tp in typeParameters %}
        {{ tp | typeParameterRenderer }}
        <br/>
    {% endfor %}
{% endif %}
{% if indexers %}
    # &#128712; Indexer(s)
    {% for i in indexers %}
        {% if i.comment %}
            **&#128366; Summary**
            {{ i.comment | commentRenderer}}
        {% endif %}
        <br/>
        {% if i.returnType %}
            **&#128966; Return Type**
            {{ i.returnType | typeRenderer}}
        {% endif %}
        <br/>
        | Key Name        | Key Type                       |
        |-----------------|--------------------------------|
        | {{ i.keyName }} | {{ i.keyType | typeRenderer }} |
        <br/>
    {% endfor %}
{% endif %}
{% if constructors %}
    # &#128712; Constructor(s)
    {% for c in constructors %}
        {% if c.comment %}
            ### &#128366; Summary
            {{ c.comment | commentRenderer }}
        {% endif %}
        <br/>
        {% if c.typeParameters %}
            ### &#128966; Type Parameter(s)
            {% for tp in c.typeParameters %}
                {{ tp | typeParameterRenderer }}
                <br/>
            {% endfor %}
        {% endif %}
        {% if c.returnType %}
            ### &#128966; Return Type
            {{ c.returnType | typeRenderer}}
        {% endif %}
        <br/>
        {% if c.parameters %}
            ### &#128966; Parameter(s)
            {% for p in c.parameters %}
                _**{{ p.name }}**_
                <br/>
                | Modifier(s)                              | Optional                           | Rest                          | Parameter Property                          | Initializer                       |
                |------------------------------------------|:----------------------------------:|:-----------------------------:|:-------------------------------------------:|-----------------------------------|
                | {{ p.modifiers | join(', ','declare') }} | {{ p.isOptional | print_symbol }}  | {{ p.isRest | print_symbol }} | {{ p.isParameterProperty  | print_symbol }} | {{ p.initializer | replaceWith }} |            
                <br/>
            {% endfor %}
        {% endif %}
    {% endfor %}
{% endif %}
{% if properties %}
    # &#128712; Property(ies)
    {% for pr in properties %}
        {% if pr.comment %}
            ### &#128366; Summary
            {{ pr.comment | commentRenderer}}
        {% endif %}
        ## {{ pr.name }}
        <br/>
        | Optional                           | Type                         |
        |:----------------------------------:|------------------------------|
        | {{ pr.isOptional | print_symbol }} | {{ pr.type | typeRenderer }} |
        <br/>   
    {% endfor %}
{% endif %}
{% if methods %}
    # &#128712; Method(s)
    {% for m in methods %}
        {% if m.comment %}
            ### &#128366; Summary
            {{ m.comment | commentRenderer }}
        {% endif %}
        {% if m.typeParameters %}
            ### &#128966; Type Parameter(s)
            {% for tp in m.typeParameters %}
                {{ tp | typeParameterRenderer}}
                <br/>
            {% endfor %}
        {% endif %}
        ## {{ m.name }}
        <br/>
        | Return Type                       |
        |-----------------------------------|
        | {{ m.returnType | typeRenderer }} |        
        <br/>
        {% if m.parameters %}
            **&#128966; Parameter(s)**
            <br/>
            {% for p in m.parameters %}
                _**{{ p.name }}**_
                <br/> 
                | Modifier(s)                              | Optional                           | Rest                          | Parameter Property                          | Initializer                       |
                |------------------------------------------|:----------------------------------:|:-----------------------------:|:-------------------------------------------:|-----------------------------------|
                | {{ p.modifiers | join(', ','declare') }} | {{ p.isOptional | print_symbol }}  | {{ p.isRest | print_symbol }} | {{ p.isParameterProperty  | print_symbol }} | {{ p.initializer | replaceWith }} |            
                <br/>
            {% endfor %}
        {% endif %}
    {% endfor %}
{% endif %}
<br/>
{% if callSignatures %}
    # &#128712; Call Signature(s)
    {% for cs in callSignatures %}
        {% if cs.comment %}
            #### &#128366; Summary
            {{ cs.comment | commentRenderer }}
        {% endif %}
        {% if cs.typeParameters %}
            #### &#128966; Type Parameter(s)
            {% for tp in cs.typeParameters %}
                {{ tp | typeParameterRenderer }}
                <br/>
            {% endfor %}
        {% endif %}
        {% if cs.returnType %}
            #### Return Type
            {{ cs.returnType | typeRenderer }}
        {% endif %}
        <br/>
        {% if cs.parameters %}
            **&#128966; Parameter(s)**
            <br/>
            {% for p in cs.parameters %}
                _**{{ p.name }}**_
                <br/>   
                | Modifier(s)                              | Optional                           | Rest                          | Parameter Property                          | Initializer                       |
                |------------------------------------------|:----------------------------------:|:-----------------------------:|:-------------------------------------------:|-----------------------------------|
                | {{ p.modifiers | join(', ','declare') }} | {{ p.isOptional | print_symbol }}  | {{ p.isRest | print_symbol }} | {{ p.isParameterProperty  | print_symbol }} | {{ p.initializer | replaceWith }} |            
                <br/>
            {% endfor %}
        {% endif %}
    {% endfor %}
{% endif %}
`;
