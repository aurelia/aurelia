# Router

### Routing Life-cycle

{% tabs %}
{% tab title="Aurelia 1" %}
| Name | Description |
| :--- | :--- |
| canActivate | if the component can be activated. |
| activate | when the component gets activated. |
| canDeactivate | if the component can be deactivated. |
| deactivate | when the component gets deactivated. |
{% endtab %}

{% tab title="Aurelia 2" %}
| Name | Aurelia 1 | Asyncable | Description |
| :--- | :--- | :--- | :--- |
| canLoad | canActivate | **✓** |  |
| load | activate | **✓** |  |
| canUnload | canDeactivate | **✓** |  |
| unload | deactivate | **✓** |  |
{% endtab %}
{% endtabs %}



