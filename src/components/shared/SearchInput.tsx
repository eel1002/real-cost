import { useAtomValue, useSetAtom } from 'jotai';
import { ChangeEvent, memo, useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import { SearchResult } from 'types';
import { useDebounce, useEffectOnce } from 'usehooks-ts';
import marketSearch from '~/atoms/marketSearch';
import searchResult from '~/atoms/searchResult';
import { MARKET_URL } from '~/constants';
import useAxiosClient from '~/services/axiosClient';
import { handleTikiSearch } from '~/utils/handleMarketSearch';

import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SearchInputProps {
    styles?: string;
    focusOnMount?: boolean;
}

function SearchInput({ styles, focusOnMount }: SearchInputProps) {
    const [value, setValue] = useState('');
    const market = useAtomValue(marketSearch);
    const setResult = useSetAtom(searchResult);
    const axiosClient = useAxiosClient(MARKET_URL(market));
    const inputRef = useRef<HTMLInputElement | null>(null);
    const debouncedValue = useDebounce<string>(value, 400);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
    };

    const { data: searchResults } = useSWR<SearchResult[]>(
        `${market} ${debouncedValue}`,
        async (slug: string) => {
            const market = slug.split(' ')[0];
            const keyword = slug.split(' ')[1];

            if (!keyword) return [];

            switch (market) {
                case 'tiki':
                    const { data: tikiData } = await axiosClient.get(
                        `/api/v2/products?limit=10&aggregations=2&q=${encodeURIComponent(
                            keyword,
                        )}`,
                    );

                    const tikiResult = handleTikiSearch(tikiData?.data);

                    return tikiResult?.length ? tikiResult : [];

                default:
                    const { data } = await axiosClient.get(`/products/search`, {
                        params: {
                            market: market,
                            keyword: keyword,
                        },
                    });

                    if (!data || !data?.products) {
                        return [];
                    }

                    if (market !== 'all' && data?.products?.length) {
                        return data?.products
                            .map((item: any) => {
                                return { ...item, market };
                            })
                            .slice(0, 10);
                    }

                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    //@ts-ignore
                    let result = [];

                    for (const [key, value] of Object.entries(data?.products)) {
                        if (Array.isArray(value))
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            //@ts-ignore
                            result = result.concat([
                                ...value?.slice(0, 10).map((item: any) => ({
                                    ...item,
                                    market: key,
                                })),
                            ]);
                    }

                    return result;
            }
        },
    );

    useEffect(() => {
        setResult({
            isFetching: debouncedValue !== '',
            items: searchResults || [],
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchResults, market, debouncedValue]);

    useEffectOnce(() => {
        if (focusOnMount) {
            inputRef.current?.focus();
        }
    });

    return (
        <div className={styles}>
            <MagnifyingGlassIcon className="h-8 w-8" />

            <input
                id="real-cost-search"
                onChange={handleChange}
                value={value}
                type="text"
                className="h-12 w-full"
                placeholder="Tìm kiếm sản phẩm..."
            />

            <button onClick={() => setValue('')} className="p-2">
                <XMarkIcon className="h-8 w-8 rounded-lg border-[1px] border-gray-600" />
            </button>
        </div>
    );
}
export default memo(SearchInput);
