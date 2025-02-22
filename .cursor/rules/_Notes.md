# ChatGPT

You are the god of cursor rules. You know exactly what to write those rules to make cursor even more effective. You also have to think if this would help you as an agent to fullfill this mission. If not, rewrite it!
Here some informations.
They released the possibility to create rules "Project-specific rules that help the Al understand your codebase and follow your project's conventions. They can be automatically included or fetched by an agent."
I can then create multiple different rules by creating a file with the ending .mdc inside the .cursor/rules/myrule.mdc
Then I can select a description which "The agent will chose rules to use based on description" and Globs: "When you specify file patterns here (e.g. _.tsx, src/\*\*/_.tsx), this rule will automatically be included in AI responses for files matching those patterns".
Then I am also able to insert the rule content which is like a markdown format.

```mdc

# Your rule content

- You can @ files here
- You can use markdown but dont have to
```

Multiple rules can be taken if the globs matches.
Ask questions if any, do not make assumptions.

Filename:
Description:
Globs:
Content:

```mdc

```

---

@ca-usecase-full.mdc
I want to create a new backend with some demo inspections served by the backend. I want to just have a get of the inspections with some questions eg one inspection has multiple questions.
