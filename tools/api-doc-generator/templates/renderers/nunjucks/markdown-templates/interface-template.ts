export const interfaceTemplate = `
{% if comment %}
    # 🕮 Summary
    {{ comment | commentRenderer }}
{% endif %}
<br/>
# {{ name | replaceWith }}
| Modifier(s)                            | Extends                                    |
|----------------------------------------|--------------------------------------------|
| {{ modifiers | join(', ','declare') }} | {{ extends | typesRenderer | join(', ') }} |
<br/>
{% if typeParameters %}
    # 🌟 Type Parameter(s)
    {% for tp in typeParameters %}
        {{ tp | typeParameterRenderer }}
        <br/>
    {% endfor %}
{% endif %}
{% if indexers %}
    # 🌟 Indexer(s)
    {% for i in indexers %}
        {% if i.comment %}
            **🕮 Summary**
            {{ i.comment | commentRenderer}}
        {% endif %}
        <br/>
        {% if i.returnType %}
            **✦ Return Type**
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
    # 🌟 Constructor(s)
    {% for c in constructors %}
        {% if c.comment %}
            ### 🕮 Summary
            {{ c.comment | commentRenderer }}
        {% endif %}
        <br/>
        {% if c.typeParameters %}
            ### ✦ Type Parameter(s)
            {% for tp in c.typeParameters %}
                {{ tp | typeParameterRenderer }}
                <br/>
            {% endfor %}
        {% endif %}
        {% if c.returnType %}
            ### ✦ Return Type
            {{ c.returnType | typeRenderer}}
        {% endif %}
        <br/>
        {% if c.parameters %}
            ### ✦ Parameter(s)
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
    # 🌟 Property(ies)
    {% for pr in properties %}
        {% if pr.comment %}
            ### 🕮 Summary
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
    # 🌟 Method(s)
    {% for m in methods %}
        {% if m.comment %}
            ### 🕮 Summary
            {{ m.comment | commentRenderer }}
        {% endif %}
        {% if m.typeParameters %}
            ### ✦ Type Parameter(s)
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
            **✦ Parameter(s)**
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
    # 🌟 Call Signature(s)
    {% for cs in callSignatures %}
        {% if cs.comment %}
            #### 🕮 Summary
            {{ cs.comment | commentRenderer }}
        {% endif %}
        {% if cs.typeParameters %}
            #### ✦ Type Parameter(s)
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
            **✦ Parameter(s)**
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
