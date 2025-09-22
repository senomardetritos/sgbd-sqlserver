# SET VENV
python3 -m venv venv
source venv/bin/activate

# GERAR DOCUMENTAÇÃO

### Gerar documentação HTML
sphinx-build -b html docs docs/build

### Gerar automaticamente com autodoc
sphinx-apidoc -o docs ./

### Gerar e visualizar localmente
sphinx-build -b html docs docs/build && open docs/build/index.html