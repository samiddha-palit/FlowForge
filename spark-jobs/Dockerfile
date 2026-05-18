FROM apache/spark:3.5.1-python3

USER root

# Download Hadoop S3A + AWS SDK jars for MinIO (S3-compatible) support
ENV HADOOP_AWS_VERSION=3.3.4
ENV AWS_SDK_VERSION=1.12.262
ENV JAR_DIR=/opt/spark/jars

RUN apt-get update -qq && apt-get install -y -qq curl && rm -rf /var/lib/apt/lists/* \
    && curl -fsSL \
       "https://repo1.maven.org/maven2/org/apache/hadoop/hadoop-aws/${HADOOP_AWS_VERSION}/hadoop-aws-${HADOOP_AWS_VERSION}.jar" \
       -o "${JAR_DIR}/hadoop-aws-${HADOOP_AWS_VERSION}.jar" \
    && curl -fsSL \
       "https://repo1.maven.org/maven2/com/amazonaws/aws-java-sdk-bundle/${AWS_SDK_VERSION}/aws-java-sdk-bundle-${AWS_SDK_VERSION}.jar" \
       -o "${JAR_DIR}/aws-java-sdk-bundle-${AWS_SDK_VERSION}.jar"

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY runner.py .

USER spark
