package org.eclipse.dirigible.graalium.core.graal;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;

import org.eclipse.dirigible.graalium.core.javascript.JavascriptModuleType;
import org.graalvm.polyglot.Source;

public class GraalJSSourceCreator {

    private final JavascriptModuleType jsModuleType;

    public GraalJSSourceCreator(JavascriptModuleType jsModuleType) {
        this.jsModuleType = jsModuleType;
    }

    public Source createSource(String source, String fileName) {
        Source.Builder sourceBuilder = Source.newBuilder("js", source, fileName);
        return createSource(sourceBuilder);
    }

    public Source createInternalSource(String source, String fileName) {
        Source.Builder sourceBuilder = Source.newBuilder("js", source, fileName).internal(true);
        return createSource(sourceBuilder);
    }

    public Source createSource(Path sourceFilePath) {
        File codeFile = sourceFilePath.toFile();
        Source.Builder sourceBuilder = Source.newBuilder("js", codeFile);
        return createSource(sourceBuilder);
    }

    private Source createSource(Source.Builder sourceBuilder) {
        try {
            if (JavascriptModuleType.ESM.equals(jsModuleType)) {
                sourceBuilder.mimeType("application/javascript+module");
            }

            return sourceBuilder
                    .cached(false)
                    .encoding(StandardCharsets.UTF_8)
                    .build();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}