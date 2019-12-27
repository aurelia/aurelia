export const interfaceTemplate = `
# {{ name | mdEscape | replaceWith }}
<br/>
{% if comment %}
    ## ✦ Summary
    {{ comment | commentRenderer }}
{% endif %}
<br/>
| Modifier(s)                            | Extends                                    |
|----------------------------------------|--------------------------------------------|
| {{ modifiers | join(', ','declare') }} | {{ extends | typesRenderer | join(', ') }} |
<br/>
{% if typeParameters %}
    ## ✦ Type Parameter(s)
    {% for tp in typeParameters %}
        {{ tp | typeParameterRenderer }}
        <br/>
    {% endfor %}
{% endif %}
{% if indexers %}
    ## ✦ Indexer(s)
    {% for i in indexers %}
        {% if i.comment %}
            &nbsp;&nbsp; **Summary**
            &nbsp;&nbsp; {{ i.comment | commentRenderer}}
        {% endif %}
        <br/>
        {% if i.returnType %}
            | Return Type                      |
            |----------------------------------|
            | {{ i.returnType | typeRenderer}} |
        {% endif %}
        <br/>
        | Key Name                   | Key Type                       |
        |----------------------------|--------------------------------|
        | {{ i.keyName | mdEscape }} | {{ i.keyType | typeRenderer }} |
        <br/>
    {% endfor %}
{% endif %}
{% if constructors %}
    ## ✦ Constructor(s)
    {% for c in constructors %}
        {% if c.comment %}
            &nbsp;&nbsp; **Summary**
            &nbsp;&nbsp; {{ c.comment | commentRenderer }}
        {% endif %}
        <br/>
        {% if c.typeParameters %}
            &nbsp;&nbsp; **Type Parameter(s)**
            {% for tp in c.typeParameters %}
                {{ tp | typeParameterRenderer }}
                <br/>
            {% endfor %}
        {% endif %}
        {% if c.returnType %}
            | Return Type                      |
            |----------------------------------|
            | {{ c.returnType | typeRenderer}} |
        {% endif %}
        <br/>
        {% if c.parameters %}
            &nbsp;&nbsp; **Parameter(s)**
            {% for p in c.parameters %}
                &nbsp;&nbsp;&nbsp;&nbsp; _**{{ p.name | mdEscape }}**_
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
    ## ✦ Property(ies)
    {% for pr in properties %}
        &nbsp;&nbsp; **{{ pr.name | mdEscape }}**
        <br/>
        {% if pr.comment %}
            &nbsp;&nbsp;&nbsp;&nbsp; **Summary**
            &nbsp;&nbsp;&nbsp;&nbsp; {{ pr.comment | commentRenderer}}
        {% endif %}
        <br/>
        | Optional                           | Type                         |
        |:----------------------------------:|------------------------------|
        | {{ pr.isOptional | print_symbol }} | {{ pr.type | typeRenderer }} |
        <br/>   
    {% endfor %}
{% endif %}
{% if methods %}
    ## ✦ Method(s)
    {% for m in methods %}
        &nbsp;&nbsp; {{ m.name | mdEscape }}
        <br/>
        {% if m.comment %}
            &nbsp;&nbsp;&nbsp;&nbsp; **Summary**
            &nbsp;&nbsp;&nbsp;&nbsp; {{ m.comment | commentRenderer }}
        {% endif %}
        {% if m.typeParameters %}
            &nbsp;&nbsp;&nbsp;&nbsp; **Type Parameter(s)**
            {% for tp in m.typeParameters %}
                {{ tp | typeParameterRenderer}}
                <br/>
            {% endfor %}
        {% endif %}
        <br/>
        {% if m.returnType %}
            | Return Type                      |
            |----------------------------------|
            | {{ m.returnType | typeRenderer}} |           
        {% endif %}       
        <br/>
        {% if m.parameters %}
            &nbsp;&nbsp;&nbsp;&nbsp;**Parameter(s)**
            <br/>
            {% for p in m.parameters %}
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;_**{{ p.name | mdEscape }}**_
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
    ## ✦ Call Signature(s)
    {% for cs in callSignatures %}
        {% if cs.comment %}
            &nbsp;&nbsp; **Summary**
            &nbsp;&nbsp; {{ cs.comment | commentRenderer }}
            <br/>
        {% endif %}
        {% if cs.typeParameters %}
            &nbsp;&nbsp; **Type Parameter(s)**
            {% for tp in cs.typeParameters %}
                {{ tp | typeParameterRenderer }}
                <br/>
            {% endfor %}
        {% endif %}
        {% if cs.returnType %}
            | Return Type                       |
            |-----------------------------------|
            | {{ cs.returnType | typeRenderer}} |
        {% endif %}
        <br/>
        {% if cs.parameters %}
            &nbsp;&nbsp; **Parameter(s)**
            <br/>
            {% for p in cs.parameters %}
                &nbsp;&nbsp;&nbsp;&nbsp; _**{{ p.name | mdEscape }}**_
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
