import crypto from 'crypto-js';
import { useState } from 'react';
import { Space, Table, Tag } from 'antd';

const { Column } = Table;

interface CalculatedFile {
  name: string;
  md5: string;
}

function App() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [calculatedFilesMd5, setCalculatedFilesMd5] = useState<
    CalculatedFile[]
  >([]);

  const filesInput = document.getElementById('file-input') as HTMLInputElement;
  const directoryInput = document.getElementById(
    'directory-input',
  ) as HTMLInputElement;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const calculateMd5 = async () => {
    setCalculatedFilesMd5([]);

    //  Array of Promises to calculate the MD5 hash for each selected file
    const promises = selectedFiles.map((file) => {
      return new Promise<CalculatedFile>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onload = () => {
          const md5 = crypto.MD5(reader.result as string).toString();
          resolve({ name: file.name, md5 });
        };
        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };
      });
    });

    try {
      const calculatedFiles = await Promise.all(promises);
      setCalculatedFilesMd5(calculatedFiles);
    } catch (error) {
      console.error(error);
    }
  };

  const data = calculatedFilesMd5.map((file, index) => ({
    key: index,
    name: file.name,
    md5: file.md5,
  }));

  return (
    <main>
      <h1 className="hero">MD5 Calculator</h1>
      <h2 className="choose-header">Choose file or directory</h2>
      <p className="warning">
        <span className="warning-label">Warning:</span> Processing large amount
        of files can be resource-intensive and may cause performance issues on
        your browser. We recommend selecting smaller amount of files to ensure a
        smooth experience.
      </p>
      <div className="input-options">
        <div className="input-group">
          <label htmlFor="file-input">Choose Files</label>
          <input
            onChange={(e) => {
              handleFileChange(e);
              if (directoryInput) {
                directoryInput.value = '';
              }
            }}
            type="file"
            id="file-input"
            multiple
          />
        </div>
        <div className="input-group">
          <label htmlFor="directory-input">Choose Directory</label>
          <input
            type="file"
            id="directory-input"
            /* @ts-expect-error  React bug */
            // eslint-disable-next-line react/no-unknown-property
            directory=""
            webkitdirectory=""
            multiple
            onChange={(e) => {
              handleFileChange(e);
              if (filesInput) {
                filesInput.value = '';
              }
            }}
          />
        </div>
      </div>
      <h2>Selected files: {selectedFiles.length}</h2>
      <button onClick={calculateMd5}>calculate MD5</button>
      {calculatedFilesMd5.length > 0 && (
        <Table
          className="data-table"
          dataSource={data}
          scroll={{
            x: 500,
          }}
        >
          <Column title="Name" dataIndex="name" key="name" />
          <Column title="MD5" dataIndex="md5" key="md5" />
        </Table>
      )}
    </main>
  );
}

export default App;
