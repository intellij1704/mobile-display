import React from 'react';

const InTheBoxSection = ({ product }) => {
    return (
        <div className="container mx-auto p-4">
            {/* In The Box Section */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 bg-white shadow-md">
                    {/* Header */}
                    <thead>
                        <tr className="bg-gray-200">
                            <th
                                colSpan="2"
                                className="p-2 text-center text-md md:text-lg font-semibold text-gray-800 border-b border-gray-300"
                            >
                                IN THE BOX
                            </th>
                        </tr>
                    </thead>
                    {/* Body */}
                    <tbody
                        dangerouslySetInnerHTML={{
                            __html: product?.inTheBox
                                ? `
                  ${product.inTheBox
                                    .split('<br>')
                                    .filter(item => item.trim())
                                    .map((item, index, array) => {
                                        if (index % 2 === 0 && array[index + 1]) {
                                            return `
                          <tr className="border-b border-gray-300">
                            <td className="p-3 font-medium text-gray-700 border-r border-gray-300 w-1/3">
                              ${item.replace(/<[^>]+>/g, '')}
                            </td>
                            <td className="p-3 text-gray-600 text-sm">
                              ${array[index + 1].replace(/<[^>]+>/g, '')}
                            </td>
                          </tr>
                        `;
                                        }
                                        return '';
                                    })
                                    .join('')}
                `
                                : `
                  <tr className="border-b border-gray-300">
                    <td className="p-3 font-medium text-gray-700 border-r border-gray-300 w-1/3">
                      No content available
                    </td>
                    <td className="p-3 text-gray-600 text-sm">
                      -
                    </td>
                  </tr>
                `,
                        }}
                    />
                </table>
            </div>
        </div>
    );
};

export default InTheBoxSection;