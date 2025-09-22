class JsonCustomEncoder:

    def toStr(data):
        for i, d in enumerate(data):
            for key in d:
                data[i][key] = str(d[key])
        return data
